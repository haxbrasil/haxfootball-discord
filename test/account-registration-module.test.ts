import { MessageFlags, type Interaction } from "discord.js";
import type { Account } from "@haxbrasil/haxfootball-api-sdk";
import { describe, expect, it, vi } from "vitest";
import type { AppContext } from "../src/core/app-context";
import { createInteractionRouter } from "../src/core/interaction-router";
import { createAccountRegistrationModule } from "../src/features/account-registration/account-registration.module";
import { accountRegistrationIds } from "../src/features/account-registration/discord/custom-ids";

describe("account registration module", () => {
  it("posts the registration panel from the admin command", async () => {
    const send = vi.fn();
    const reply = vi.fn();
    const router = routerFixture();

    await router.handle(
      fakeChatInputCommand({
        channel: { send },
        reply,
        memberPermissions: { has: () => true }
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
        memberPermissions: { has: () => true },
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
    const reply = vi.fn();
    const createAccount = vi.fn(async () => ({
      ok: true as const,
      data: {
        uuid: "00000000-0000-4000-8000-000000000000",
        name: "Player1",
        externalId: "123456789012345678",
        role: {
          uuid: "10000000-0000-4000-8000-000000000000",
          name: "default",
          title: "Default",
          permissions: [],
          isDefault: true,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z"
        },
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z"
      }
    }));
    const router = routerFixture();

    await router.handle(
      fakeModalSubmit({
        reply
      }),
      contextFixture({ createAccount })
    );

    expect(createAccount).toHaveBeenCalledWith({
      discordUserId: "123456789012345678",
      name: "Player1",
      password: "pass1234"
    });
    expect(reply).toHaveBeenCalledWith({
      content: "Account registered as Player1.",
      flags: MessageFlags.Ephemeral
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
    memberPermissions: { has: () => true },
    ...overrides
  } as unknown as Interaction;
}

function fakeButton(overrides: Record<string, unknown> = {}): Interaction {
  return {
    isChatInputCommand: () => false,
    isButton: () => true,
    isModalSubmit: () => false,
    customId: accountRegistrationIds.openModalButton,
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
  resetPassword = async () => {
    throw new Error("not implemented");
  }
}: {
  createAccount?: AppContext["haxFootball"]["accountRegistration"]["createAccount"];
  resetPassword?: AppContext["haxFootball"]["accountRegistration"]["resetPassword"];
} = {}): AppContext {
  return {
    haxFootball: {
      accountRegistration: {
        createAccount,
        resetPassword
      }
    },
    logger: {
      error: vi.fn(),
      info: vi.fn(),
      warn: vi.fn()
    }
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
      title: "Default",
      permissions: [],
      isDefault: true,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z"
    },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z"
  };
}
