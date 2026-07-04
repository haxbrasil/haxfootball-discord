import { MessageFlags, type Interaction } from "discord.js";
import type { Account } from "@haxbrasil/haxfootball-api-sdk";
import { describe, expect, it, vi } from "vitest";
import type { AppContext } from "../src/core/app-context";
import { createInteractionRouter } from "../src/core/interaction-router";
import { createAccountRegistrationModule } from "../src/features/account-registration/account-registration.module";
import {
  accountRegistrationIds,
  liveRegistrationButtonId
} from "../src/features/account-registration/discord/custom-ids";
import { discordPermissions } from "../src/features/discord-permissions/domain/discord-permissions";

describe("account registration module", () => {
  it("posts the registration panel from the admin command", async () => {
    const send = vi.fn();
    const reply = vi.fn();
    const router = routerFixture();

    await router.handle(
      fakeChatInputCommand({
        channel: { send },
        reply
      }),
      contextFixture()
    );

    const panel = send.mock.calls[0]?.[0];

    expect(panel.embeds[0].data).toMatchObject({
      title: "BFL Account Registration",
      description:
        "Click the button below to create your BFL account and link it to Discord.",
      color: 0x1f8b4c
    });
    expect(panel.components[0].components[0].data).toMatchObject({
      custom_id: accountRegistrationIds.openModalButton,
      label: "Register account"
    });
    expect(panel.components[0].components[1].data).toMatchObject({
      custom_id: accountRegistrationIds.openPasswordResetModalButton,
      label: "Forgot my password"
    });
    expect(reply).toHaveBeenCalledWith({
      content: "Registration panel posted.",
      flags: MessageFlags.Ephemeral
    });
  });

  it("posts a customized registration panel", async () => {
    const send = vi.fn();
    const reply = vi.fn();
    const router = routerFixture();

    await router.handle(
      fakeChatInputCommand({
        channel: { send },
        reply,
        options: {
          getSubcommand: () =>
            accountRegistrationIds.postPanelCommand.subcommand,
          getString: (name: string) =>
            ({
              title: "Join BFL",
              description: "Register before playing.",
              button_label: "Create account",
              forgot_password_button_label: "Change password",
              color: "#00AEEF",
              image_url: "https://example.com/banner.png",
              thumbnail_url: "https://example.com/logo.png"
            })[name] ?? null
        }
      }),
      contextFixture()
    );

    const panel = send.mock.calls[0]?.[0];

    expect(panel.embeds[0].data).toMatchObject({
      title: "Join BFL",
      description: "Register before playing.",
      color: 0x00aeef,
      image: { url: "https://example.com/banner.png" },
      thumbnail: { url: "https://example.com/logo.png" }
    });
    expect(panel.components[0].components[0].data).toMatchObject({
      label: "Create account"
    });
    expect(panel.components[0].components[1].data).toMatchObject({
      label: "Change password"
    });
  });

  it("requires the Discord manager API permission to post the registration panel", async () => {
    const send = vi.fn();
    const reply = vi.fn();
    const hasPermission = vi.fn(async () => ({
      ok: true as const,
      data: false
    }));
    const router = routerFixture();

    await router.handle(
      fakeChatInputCommand({
        channel: { send },
        reply
      }),
      contextFixture({ hasPermission })
    );

    expect(hasPermission).toHaveBeenCalledWith({
      discordUserId: "123456789012345678",
      permission: discordPermissions.manager
    });
    expect(send).not.toHaveBeenCalled();
    expect(reply).toHaveBeenCalledWith({
      content: "You do not have permission to post the registration panel.",
      flags: MessageFlags.Ephemeral
    });
  });

  it("does not use Discord guild permissions for the registration panel", async () => {
    const send = vi.fn();
    const reply = vi.fn();
    const router = routerFixture();

    await router.handle(
      fakeChatInputCommand({
        channel: { send },
        memberPermissions: { has: () => false },
        reply
      }),
      contextFixture()
    );

    expect(send).toHaveBeenCalledOnce();
    expect(reply).toHaveBeenCalledWith({
      content: "Registration panel posted.",
      flags: MessageFlags.Ephemeral
    });
  });

  it("opens the registration modal from the button", async () => {
    const showModal = vi.fn();
    const router = routerFixture();

    await router.handle(
      fakeButton({
        showModal
      }),
      contextFixture()
    );

    expect(showModal).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          custom_id: accountRegistrationIds.submitModal
        })
      })
    );
  });

  it("opens the password reset modal from the forgot password button", async () => {
    const showModal = vi.fn();
    const router = routerFixture();

    await router.handle(
      fakeButton({
        customId: accountRegistrationIds.openPasswordResetModalButton,
        showModal
      }),
      contextFixture()
    );

    expect(showModal).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          custom_id: accountRegistrationIds.submitPasswordResetModal
        })
      })
    );
  });

  it("creates an account from the modal submission", async () => {
    const deferReply = vi.fn();
    const editReply = vi.fn();
    const createAccount = vi.fn(async () => ({
      ok: true as const,
      data: accountFixture()
    }));
    const findLiveRegistrationCandidates = vi.fn(async () => ({
      ok: true as const,
      data: []
    }));
    const router = routerFixture();

    await router.handle(
      fakeModalSubmit({
        deferReply,
        editReply
      }),
      contextFixture({ createAccount, findLiveRegistrationCandidates })
    );

    expect(deferReply).toHaveBeenCalledWith({
      flags: MessageFlags.Ephemeral
    });
    expect(createAccount).toHaveBeenCalledWith({
      discordUserId: "123456789012345678",
      name: "Player1",
      password: "pass1234"
    });
    expect(findLiveRegistrationCandidates).toHaveBeenCalledWith("Player1");
    expect(editReply).toHaveBeenCalledWith({
      content: "Account registered as Player1."
    });
  });

  it("shows live registration confirmation prompts for matching room players", async () => {
    const deferReply = vi.fn();
    const editReply = vi.fn();
    const followUp = vi.fn();
    const createAccount = vi.fn(async () => ({
      ok: true as const,
      data: accountFixture()
    }));
    const findLiveRegistrationCandidates = vi.fn(async () => ({
      ok: true as const,
      data: [
        liveRegistrationCandidateFixture({
          roomId: "00000000-0000-4000-8000-000000000001",
          roomName: "Main Room",
          roomPlayerId: 1
        }),
        liveRegistrationCandidateFixture({
          roomId: "00000000-0000-4000-8000-000000000002",
          roomName: "Second Room",
          roomPlayerId: 2
        })
      ]
    }));
    const router = routerFixture();

    await router.handle(
      fakeModalSubmit({
        deferReply,
        editReply,
        followUp
      }),
      contextFixture({ createAccount, findLiveRegistrationCandidates })
    );

    expect(editReply).toHaveBeenCalledWith(
      expect.objectContaining({
        content:
          "Account registered as Player1.\nIs this you in Main Room as Player1?",
        components: expect.any(Array)
      })
    );
    expect(followUp).toHaveBeenCalledWith(
      expect.objectContaining({
        content: "Is this you in Second Room as Player1?",
        components: expect.any(Array),
        flags: MessageFlags.Ephemeral
      })
    );
  });

  it("confirms a matching live room player from the button", async () => {
    const update = vi.fn();
    const editReply = vi.fn();
    const confirmLiveRegistration = vi.fn(async () => ({
      ok: true as const,
      data: liveRoomCommandFixture()
    }));
    const router = routerFixture();

    await router.handle(
      fakeButton({
        customId: liveRegistrationButtonId({
          action: "confirm",
          roomId: "00000000-0000-4000-8000-000000000001",
          roomPlayerId: 1
        }),
        update,
        editReply
      }),
      contextFixture({ confirmLiveRegistration })
    );

    expect(update).toHaveBeenCalledWith({
      content: "Confirming your live room player...",
      components: []
    });
    expect(confirmLiveRegistration).toHaveBeenCalledWith({
      discordUserId: "123456789012345678",
      roomId: "00000000-0000-4000-8000-000000000001",
      roomPlayerId: 1
    });
    expect(editReply).toHaveBeenCalledWith({
      content: "Confirmed. You are signed in inside the room.",
      components: []
    });
  });

  it("declines a live room player confirmation from the button", async () => {
    const update = vi.fn();
    const confirmLiveRegistration = vi.fn();
    const router = routerFixture();

    await router.handle(
      fakeButton({
        customId: liveRegistrationButtonId({
          action: "decline",
          roomId: "00000000-0000-4000-8000-000000000001",
          roomPlayerId: 1
        }),
        update
      }),
      contextFixture({ confirmLiveRegistration })
    );

    expect(confirmLiveRegistration).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledWith({
      content: "Skipped this room.",
      components: []
    });
  });

  it("changes password from the password reset modal submission", async () => {
    const reply = vi.fn();
    const resetPassword = vi.fn(async () => ({
      ok: true as const,
      data: accountFixture()
    }));
    const router = routerFixture();

    await router.handle(
      fakePasswordResetModalSubmit({
        reply
      }),
      contextFixture({ resetPassword })
    );

    expect(resetPassword).toHaveBeenCalledWith({
      discordUserId: "123456789012345678",
      password: "newpass123"
    });
    expect(reply).toHaveBeenCalledWith({
      content: "Password updated.",
      flags: MessageFlags.Ephemeral
    });
  });

  it("reports missing linked account during password reset", async () => {
    const reply = vi.fn();
    const resetPassword = vi.fn(async () => ({
      ok: false as const,
      error: {
        kind: "account_not_found" as const
      }
    }));
    const router = routerFixture();

    await router.handle(
      fakePasswordResetModalSubmit({
        reply
      }),
      contextFixture({ resetPassword })
    );

    expect(reply).toHaveBeenCalledWith({
      content: "Your Discord account is not linked to a BFL account yet.",
      flags: MessageFlags.Ephemeral
    });
  });
});

function routerFixture() {
  const module = createAccountRegistrationModule();

  return createInteractionRouter(module.handlers);
}

function fakeChatInputCommand(
  overrides: Record<string, unknown> = {}
): Interaction {
  return {
    isChatInputCommand: () => true,
    isButton: () => false,
    isModalSubmit: () => false,
    commandName: accountRegistrationIds.postPanelCommand.command,
    options: {
      getSubcommand: () => accountRegistrationIds.postPanelCommand.subcommand,
      getString: () => null
    },
    inGuild: () => true,
    user: {
      id: "123456789012345678"
    },
    ...overrides
  } as unknown as Interaction;
}

function fakeButton(overrides: Record<string, unknown> = {}): Interaction {
  return {
    isChatInputCommand: () => false,
    isButton: () => true,
    isModalSubmit: () => false,
    customId: accountRegistrationIds.openModalButton,
    user: {
      id: "123456789012345678"
    },
    ...overrides
  } as unknown as Interaction;
}

function fakeModalSubmit(overrides: Record<string, unknown> = {}): Interaction {
  return {
    isChatInputCommand: () => false,
    isButton: () => false,
    isModalSubmit: () => true,
    customId: accountRegistrationIds.submitModal,
    user: {
      id: "123456789012345678"
    },
    fields: {
      getTextInputValue(customId: string) {
        if (customId === accountRegistrationIds.nameInput) {
          return "Player1";
        }

        if (customId === accountRegistrationIds.passwordInput) {
          return "pass1234";
        }

        throw new Error(`Unexpected input: ${customId}`);
      }
    },
    ...overrides
  } as unknown as Interaction;
}

function fakePasswordResetModalSubmit(
  overrides: Record<string, unknown> = {}
): Interaction {
  return {
    isChatInputCommand: () => false,
    isButton: () => false,
    isModalSubmit: () => true,
    customId: accountRegistrationIds.submitPasswordResetModal,
    user: {
      id: "123456789012345678"
    },
    fields: {
      getTextInputValue(customId: string) {
        if (customId === accountRegistrationIds.newPasswordInput) {
          return "newpass123";
        }

        throw new Error(`Unexpected input: ${customId}`);
      }
    },
    ...overrides
  } as unknown as Interaction;
}

function contextFixture({
  createAccount = async () => {
    throw new Error("not implemented");
  },
  findLiveRegistrationCandidates = async () => {
    throw new Error("not implemented");
  },
  confirmLiveRegistration = async () => {
    throw new Error("not implemented");
  },
  resetPassword = async () => {
    throw new Error("not implemented");
  },
  hasPermission = async () => ({
    ok: true,
    data: true
  })
}: {
  createAccount?: AppContext["haxFootball"]["accountRegistration"]["createAccount"];
  findLiveRegistrationCandidates?: AppContext["haxFootball"]["accountRegistration"]["findLiveRegistrationCandidates"];
  confirmLiveRegistration?: AppContext["haxFootball"]["accountRegistration"]["confirmLiveRegistration"];
  resetPassword?: AppContext["haxFootball"]["accountRegistration"]["resetPassword"];
  hasPermission?: AppContext["haxFootball"]["discordPermissions"]["hasPermission"];
} = {}): AppContext {
  return {
    haxFootball: {
      accountRegistration: {
        createAccount,
        findLiveRegistrationCandidates,
        confirmLiveRegistration,
        resetPassword
      },
      discordPermissions: {
        hasPermission
      }
    },
    logger: {
      error: vi.fn(),
      info: vi.fn(),
      warn: vi.fn()
    }
  };
}

function liveRegistrationCandidateFixture(
  overrides: Partial<
    AppContext["haxFootball"]["accountRegistration"]["findLiveRegistrationCandidates"] extends (
      ...args: never[]
    ) => Promise<infer TResult>
      ? TResult extends { ok: true; data: Array<infer TCandidate> }
        ? TCandidate
        : never
      : never
  > = {}
) {
  return {
    roomId: "00000000-0000-4000-8000-000000000001",
    roomName: "Main Room",
    roomPlayerId: 1,
    playerName: "Player1",
    team: "RED",
    gameStatus: "RUNNING",
    sessionKind: "GUEST",
    ...overrides
  };
}

function liveRoomCommandFixture() {
  return {
    id: "10000000-0000-4000-8000-000000000001",
    roomId: "00000000-0000-4000-8000-000000000001",
    name: "account-registration.confirm-player",
    payload: null,
    status: "ACKNOWLEDGED" as const,
    result: null,
    error: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    sentAt: "2026-01-01T00:00:00.000Z",
    completedAt: "2026-01-01T00:00:01.000Z"
  };
}

function accountFixture(): Account {
  return {
    uuid: "00000000-0000-4000-8000-000000000000",
    name: "Player1",
    externalId: "123456789012345678",
    role: {
      uuid: "10000000-0000-4000-8000-000000000000",
      name: "default",
      title: { value: "Default", label: "Default" },
      permissions: [],
      bypassAllPermissions: false,
      isDefault: true,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z"
    },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z"
  };
}
