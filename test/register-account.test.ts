import type { Account, ApiFailure } from "@haxbrasil/haxfootball-api-sdk";
import { describe, expect, it } from "vitest";
import type { AccountRegistrationGateway } from "../src/features/account-registration/application/account-registration-gateway";
import { registerAccount } from "../src/features/account-registration/application/register-account";

type RegisterAccountGateway = Pick<AccountRegistrationGateway, "createAccount">;

describe("registerAccount", () => {
  it("creates an account through the gateway", async () => {
    const account = accountFixture({ name: "Player1" });
    const gateway: RegisterAccountGateway = {
      async createAccount(input) {
        expect(input).toEqual({
          discordUserId: "123456789012345678",
          name: "Player1",
          password: "pass1234"
        });

        return {
          ok: true,
          data: account
        };
      }
    };

    await expect(
      registerAccount(gateway, {
        discordUserId: "123456789012345678",
        name: " Player1 ",
        password: "pass1234"
      })
    ).resolves.toEqual({
      ok: true,
      data: account
    });
  });

  it("maps duplicate account names", async () => {
    await expectRegistrationFailure(
      apiFailure("Account name already exists"),
      "name_taken"
    );
  });

  it("maps duplicate Discord accounts", async () => {
    await expectRegistrationFailure(
      apiFailure("Account external ID already exists"),
      "discord_account_taken"
    );
  });

  it("maps validation failures", async () => {
    await expectRegistrationFailure(
      apiFailure("Expected string", {
        code: "VALIDATION_ERROR"
      }),
      "invalid_input"
    );
  });

  it("maps network failures as unavailable", async () => {
    const gateway: RegisterAccountGateway = {
      async createAccount() {
        return {
          ok: false,
          error: {
            kind: "network",
            message: "fetch failed",
            cause: new Error("fetch failed")
          }
        };
      }
    };

    await expect(
      registerAccount(gateway, {
        discordUserId: "123456789012345678",
        name: "Player1",
        password: "pass1234"
      })
    ).resolves.toEqual({
      ok: false,
      error: "unavailable"
    });
  });
});

async function expectRegistrationFailure(
  failure: ApiFailure,
  expected: string
): Promise<void> {
  const gateway: RegisterAccountGateway = {
    async createAccount() {
      return {
        ok: false,
        error: failure
      };
    }
  };

  await expect(
    registerAccount(gateway, {
      discordUserId: "123456789012345678",
      name: "Player1",
      password: "pass1234"
    })
  ).resolves.toEqual({
    ok: false,
    error: expected
  });
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
      title: { value: "Default", label: "Default" },
      permissions: [],
      bypassAllPermissions: false,
      isDefault: true,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z"
    },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides
  };
}
