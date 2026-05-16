import type { Account, ApiSuccess } from "@haxbrasil/haxfootball-api-sdk";
import { describe, expect, it, vi } from "vitest";
import { createDiscordPermissionGateway } from "../src/infrastructure/haxfootball-api";
import {
  discordPermissions,
  hasDiscordPermission
} from "../src/features/discord-permissions/domain/discord-permissions";

describe("discord permissions", () => {
  it("checks direct and all Discord permissions", () => {
    expect(
      hasDiscordPermission(
        [discordPermissions.manager],
        discordPermissions.manager
      )
    ).toBe(true);
    expect(
      hasDiscordPermission([discordPermissions.all], discordPermissions.manager)
    ).toBe(true);
    expect(
      hasDiscordPermission([discordPermissions.mod], discordPermissions.manager)
    ).toBe(false);
  });

  it("checks permissions from the API account linked to the Discord user", async () => {
    const gateway = createDiscordPermissionGateway({
      list: vi.fn(async () =>
        apiSuccess({
          items: [
            accountFixture({
              externalId: "other-user",
              permissions: [discordPermissions.manager]
            }),
            accountFixture({
              externalId: "target-user",
              permissions: [discordPermissions.all]
            })
          ],
          page: {
            limit: 100,
            nextCursor: null
          }
        })
      ),
      async create() {
        throw new Error("not implemented");
      },
      async update() {
        throw new Error("not implemented");
      }
    });

    await expect(
      gateway.hasPermission({
        discordUserId: "target-user",
        permission: discordPermissions.manager
      })
    ).resolves.toEqual({
      ok: true,
      data: true
    });
  });

  it("denies permissions when no linked API account exists", async () => {
    const gateway = createDiscordPermissionGateway({
      list: vi.fn(async () =>
        apiSuccess({
          items: [],
          page: {
            limit: 100,
            nextCursor: null
          }
        })
      ),
      async create() {
        throw new Error("not implemented");
      },
      async update() {
        throw new Error("not implemented");
      }
    });

    await expect(
      gateway.hasPermission({
        discordUserId: "missing-user",
        permission: discordPermissions.manager
      })
    ).resolves.toEqual({
      ok: true,
      data: false
    });
  });
});

function apiSuccess<T>(data: T): ApiSuccess<T> {
  return {
    ok: true,
    data,
    response: {
      status: 200,
      statusText: "OK",
      url: "http://localhost/api/accounts",
      headers: new Headers()
    }
  };
}

function accountFixture({
  externalId,
  permissions
}: {
  externalId: string;
  permissions: string[];
}): Account {
  return {
    uuid: crypto.randomUUID(),
    name: externalId,
    externalId,
    role: {
      uuid: crypto.randomUUID(),
      name: "role",
      title: "Role",
      permissions,
      isDefault: false,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z"
    },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z"
  };
}
