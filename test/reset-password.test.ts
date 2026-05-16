import type { Account, ApiFailure } from "@haxbrasil/haxfootball-api-sdk";
import { describe, expect, it } from "vitest";
import type {
  AccountPasswordResetFailure,
  AccountRegistrationGateway
} from "../src/features/account-registration/application/account-registration-gateway";
import { resetPassword } from "../src/features/account-registration/application/reset-password";

describe("resetPassword", () => {
  it("changes the password through the gateway", async () => {
    const account = accountFixture({ name: "Player1" });
    const gateway: AccountRegistrationGateway = {
      async createAccount() {
        throw new Error("not implemented");
      },
      async resetPassword(input) {
        expect(input).toEqual({
          discordUserId: "123456789012345678",
          password: "newpass123"
        });

        return {
          ok: true,
          data: account
        };
      }
    };

    await expect(
      resetPassword(gateway, {
        discordUserId: "123456789012345678",
        password: "newpass123"
      })
    ).resolves.toEqual({
      ok: true,
      data: account
    });
  });

  it("maps missing linked account failures", async () => {
    const gateway = gatewayWithFailure({
      kind: "account_not_found"
    });

    await expect(
      resetPassword(gateway, {
        discordUserId: "123456789012345678",
        password: "newpass123"
      })
    ).resolves.toEqual({
      ok: false,
      error: "account_not_found"
    });
  });

  it("maps validation failures", async () => {
    await expectResetFailure(
      apiFailure("Expected string", {
        code: "VALIDATION_ERROR"
      }),
      "invalid_input"
    );
  });

  it("maps unauthorized failures", async () => {
    await expectResetFailure(
      apiFailure("Unauthorized", {
        code: "UNAUTHORIZED",
        status: 401
      }),
      "unauthorized"
    );
  });

  it("maps network failures as unavailable", async () => {
    const gateway = gatewayWithFailure({
      kind: "network",
      message: "fetch failed",
      cause: new Error("fetch failed")
    });

    await expect(
      resetPassword(gateway, {
        discordUserId: "123456789012345678",
        password: "newpass123"
      })
    ).resolves.toEqual({
      ok: false,
      error: "unavailable"
    });
  });
});

async function expectResetFailure(
  failure: ApiFailure,
  expected: string
): Promise<void> {
  await expect(
    resetPassword(gatewayWithFailure(failure), {
      discordUserId: "123456789012345678",
      password: "newpass123"
    })
  ).resolves.toEqual({
    ok: false,
    error: expected
  });
}

function gatewayWithFailure(
  failure: AccountPasswordResetFailure
): AccountRegistrationGateway {
  return {
    async createAccount() {
      throw new Error("not implemented");
    },
    async resetPassword() {
      return {
        ok: false,
        error: failure
      };
    }
  };
}

function apiFailure(
  message: string,
  options: {
    status?: number;
    code?: string;
  } = {}
): ApiFailure {
  return {
    kind: "api",
    status: options.status ?? 400,
    statusText: "Bad Request",
    url: "https://api.example.com/api/accounts",
    headers: new Headers(),
    code: options.code,
    message,
    body: {
      error: {
        code: options.code ?? "BAD_REQUEST",
        message
      }
    }
  };
}

function accountFixture(overrides: Partial<Account> = {}): Account {
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
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides
  };
}
