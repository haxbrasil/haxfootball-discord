import {
  createHaxFootballApiClient,
  type Account,
  type ApiResult,
  type CreateAccountInput,
  type ListAccountsResponse,
  type PaginationQuery,
  type UpdateAccountInput
} from "@haxbrasil/haxfootball-api-sdk";
import type { Config } from "../config";
import type {
  AccountPasswordResetFailure,
  AccountRegistrationGateway
} from "../features/account-registration/application/account-registration-gateway";
import type { Result } from "../core/result";
import type { DiscordPermissionGateway } from "../features/discord-permissions/application/discord-permission-gateway";
import { hasDiscordPermission } from "../features/discord-permissions/domain/discord-permissions";

type AccountsResource = {
  list(query?: PaginationQuery): Promise<ApiResult<ListAccountsResponse>>;
  create(input: CreateAccountInput): Promise<ApiResult<Account>>;
  update(uuid: string, input: UpdateAccountInput): Promise<ApiResult<Account>>;
};

export function createHaxFootballServices(config: Config) {
  const api = createHaxFootballApiClient({
    apiUrl: config.haxFootballApiUrl,
    apiKey: config.haxFootballApiKey
  });

  return {
    accountRegistration: createAccountRegistrationGateway(api.accounts),
    discordPermissions: createDiscordPermissionGateway(api.accounts)
  };
}

export function createAccountRegistrationGateway(
  accounts: AccountsResource
): AccountRegistrationGateway {
  return {
    async createAccount(input) {
      const result = await accounts.create({
        name: input.name,
        password: input.password,
        externalId: input.discordUserId
      });

      if (result.ok) {
        return {
          ok: true,
          data: result.data
        };
      }

      return {
        ok: false,
        error: result.error
      };
    },
    async resetPassword(input) {
      const accountResult = await findAccountByDiscordUserId(
        accounts,
        input.discordUserId
      );

      if (!accountResult.ok) {
        return accountResult;
      }

      const result = await accounts.update(accountResult.data.uuid, {
        password: input.password
      });

      if (result.ok) {
        return {
          ok: true,
          data: result.data
        };
      }

      return {
        ok: false,
        error: result.error
      };
    }
  };
}

export function createDiscordPermissionGateway(
  accounts: AccountsResource
): DiscordPermissionGateway {
  return {
    async hasPermission(input) {
      const accountResult = await findAccountByDiscordUserId(
        accounts,
        input.discordUserId
      );

      if (!accountResult.ok) {
        if (accountResult.error.kind === "account_not_found") {
          return {
            ok: true,
            data: false
          };
        }

        return {
          ok: false,
          error: accountResult.error
        };
      }

      return {
        ok: true,
        data: hasDiscordPermission(
          accountResult.data.role.permissions,
          input.permission
        )
      };
    }
  };
}

async function findAccountByDiscordUserId(
  accounts: AccountsResource,
  discordUserId: string,
  cursor?: string
): Promise<Result<Account, AccountPasswordResetFailure>> {
  const result = await accounts.list({
    limit: 100,
    ...(cursor ? { cursor } : {})
  });

  if (!result.ok) {
    return {
      ok: false,
      error: result.error
    };
  }

  const account = result.data.items.find(
    (candidate) => candidate.externalId === discordUserId
  );

  if (account) {
    return {
      ok: true,
      data: account
    };
  }

  if (!result.data.page.nextCursor) {
    return {
      ok: false,
      error: {
        kind: "account_not_found"
      }
    };
  }

  return findAccountByDiscordUserId(
    accounts,
    discordUserId,
    result.data.page.nextCursor
  );
}
