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
  AccountRegistrationGateway,
  LiveRegistrationCandidate,
  LiveRegistrationCommand,
  LiveRegistrationFailure
} from "../features/account-registration/application/account-registration-gateway";
import type { Result } from "../core/result";
import type { DiscordPermissionGateway } from "../features/discord-permissions/application/discord-permission-gateway";
import { hasDiscordPermission } from "../features/discord-permissions/domain/discord-permissions";

type AccountsResource = {
  list(query?: PaginationQuery): Promise<ApiResult<ListAccountsResponse>>;
  getByExternalId(externalId: string): Promise<ApiResult<Account>>;
  create(input: CreateAccountInput): Promise<ApiResult<Account>>;
  update(uuid: string, input: UpdateAccountInput): Promise<ApiResult<Account>>;
};

type AccountListResource = Pick<AccountsResource, "list">;

type FindPlayersByNameQuery = {
  liveRooms: {
    nodes: Array<{
      id: string;
      room: {
        name: string | null;
        gameStatus: string;
      };
      players: {
        nodes: Array<{
          roomPlayerId: number;
          name: string;
          team: string;
          sessionKind: string | null;
        }>;
      };
    }>;
  };
};

type ListRoomCommandsQuery = {
  liveRoomCommands: {
    nodes: LiveRegistrationCommand[];
  };
};

type LiveResource = {
  query<TResult, TVariables>(input: {
    document: unknown;
    variables?: TVariables;
  }): Promise<ApiResult<TResult>>;
  enqueueRoomCommand(input: {
    roomId: string;
    name: string;
    payload?: unknown;
  }): Promise<ApiResult<LiveRegistrationCommand>>;
};

const findPlayersByNameQuery = `
  query FindPlayersByName($playerName: String!) {
    liveRooms(
      where: {
        players: {
          some: {
            name: { eq: $playerName }
          }
        }
      }
    ) {
      nodes {
        id
        room {
          name
          gameStatus
        }
        players(where: { name: { eq: $playerName } }) {
          nodes {
            roomPlayerId
            name
            team
            sessionKind
          }
        }
      }
    }
  }
`;

const listRoomCommandsQuery = `
  query ListRoomCommands($roomId: UUID!, $first: Int) {
    liveRoomCommands(where: { roomId: { eq: $roomId } }, first: $first) {
      nodes {
        id
        roomId
        name
        payload
        status
        result
        error
        createdAt
        updatedAt
      }
    }
  }
`;

export function createHaxFootballServices(config: Config) {
  const api = createHaxFootballApiClient({
    apiUrl: config.haxFootballApiUrl,
    apiKey: config.haxFootballApiKey
  });

  return {
    accountRegistration: createAccountRegistrationGateway(
      api.accounts,
      api.live
    ),
    discordPermissions: createDiscordPermissionGateway(api.accounts)
  };
}

export function createAccountRegistrationGateway(
  accounts: AccountsResource,
  live?: LiveResource
): AccountRegistrationGateway {
  const findLiveRegistrationCandidates: AccountRegistrationGateway["findLiveRegistrationCandidates"] =
    async (accountName) => {
      if (!live) {
        return { ok: true, data: [] };
      }

      const result = await live.query<
        FindPlayersByNameQuery,
        { playerName: string }
      >({
        document: findPlayersByNameQuery,
        variables: { playerName: accountName }
      });

      if (!result.ok) {
        return result;
      }

      return {
        ok: true,
        data: liveRegistrationCandidates(result.data)
      };
    };

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
    findLiveRegistrationCandidates,
    async confirmLiveRegistration(input) {
      if (!live) {
        return unavailableLiveRegistration();
      }

      const accountResult = await accounts.getByExternalId(input.discordUserId);

      if (!accountResult.ok) {
        if (
          accountResult.error.kind === "api" &&
          accountResult.error.status === 404
        ) {
          return {
            ok: false,
            error: { kind: "account_not_found" }
          };
        }

        return {
          ok: false,
          error: accountResult.error
        };
      }

      const candidatesResult = await findLiveRegistrationCandidates(
        accountResult.data.name
      );

      if (!candidatesResult.ok) {
        return candidatesResult;
      }

      const candidate = candidatesResult.data.find(
        (item) =>
          item.roomId === input.roomId &&
          item.roomPlayerId === input.roomPlayerId
      );

      if (!candidate) {
        return {
          ok: false,
          error: { kind: "live_registration_candidate_not_found" }
        };
      }

      const result = await live.enqueueRoomCommand({
        roomId: input.roomId,
        name: "account-registration.confirm-player",
        payload: {
          accountName: accountResult.data.name,
          accountUuid: accountResult.data.uuid,
          discordUserId: input.discordUserId,
          roomPlayerId: input.roomPlayerId
        }
      });

      if (result.ok) {
        return waitForLiveRegistrationCommandResult(live, result.data);
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

async function waitForLiveRegistrationCommandResult(
  live: LiveResource,
  command: LiveRegistrationCommand
): Promise<Result<LiveRegistrationCommand, LiveRegistrationFailure>> {
  let current = command;

  for (let attempt = 0; attempt < 6; attempt += 1) {
    if (current.status === "ACKNOWLEDGED") {
      return { ok: true, data: current };
    }

    if (current.status === "FAILED") {
      return {
        ok: false,
        error: {
          kind: "live_registration_rejected",
          message: "Live room rejected the confirmation"
        }
      };
    }

    await wait(500);

    const result = await live.query<
      ListRoomCommandsQuery,
      { roomId: string; first: number }
    >({
      document: listRoomCommandsQuery,
      variables: {
        roomId: command.roomId,
        first: 20
      }
    });

    if (!result.ok) {
      return result;
    }

    current =
      result.data.liveRoomCommands.nodes.find(
        (item) => item.id === command.id
      ) ?? current;
  }

  return { ok: true, data: current };
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function liveRegistrationCandidates(
  data: FindPlayersByNameQuery
): LiveRegistrationCandidate[] {
  return data.liveRooms.nodes.flatMap((room) =>
    room.players.nodes.map((player) => ({
      roomId: room.id,
      roomName: room.room.name,
      roomPlayerId: player.roomPlayerId,
      playerName: player.name,
      team: player.team,
      gameStatus: room.room.gameStatus,
      sessionKind: player.sessionKind ?? null
    }))
  );
}

function unavailableLiveRegistration(): Result<
  LiveRegistrationCommand,
  LiveRegistrationFailure
> {
  return {
    ok: false,
    error: {
      kind: "network",
      message: "Live registration is not configured",
      cause: new Error("Live registration is not configured")
    }
  };
}

export function createDiscordPermissionGateway(
  accounts: AccountListResource
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
  accounts: AccountListResource,
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
