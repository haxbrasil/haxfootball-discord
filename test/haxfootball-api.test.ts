import type { ApiSuccess } from "@haxbrasil/haxfootball-api-sdk";
import { describe, expect, it, vi } from "vitest";
import { createAccountRegistrationGateway } from "../src/infrastructure/haxfootball-api";

describe("HaxFootball API gateway", () => {
  it("uses the live-state StringFilter contract when finding room players", async () => {
    let queryDocument: unknown;
    let queryVariables: unknown;
    type LiveResource = NonNullable<
      Parameters<typeof createAccountRegistrationGateway>[1]
    >;

    const query: LiveResource["query"] = async <TResult, TVariables>(input: {
      document: unknown;
      variables?: TVariables;
    }) => {
      queryDocument = input.document;
      queryVariables = input.variables;

      return apiSuccess({
        liveRooms: {
          nodes: [
            {
              id: "00000000-0000-4000-8000-000000000001",
              room: {
                name: "Main Room",
                gameStatus: "PLAYING"
              },
              players: {
                nodes: [
                  {
                    roomPlayerId: 3,
                    name: "gabinho",
                    team: "SPECTATORS",
                    sessionKind: "SIGNED_IN"
                  }
                ]
              }
            }
          ]
        }
      } as TResult);
    };

    const gateway = createAccountRegistrationGateway(
      {
        list: vi.fn(),
        getByExternalId: vi.fn(),
        create: vi.fn(),
        update: vi.fn()
      },
      {
        query,
        enqueueRoomCommand: vi.fn()
      }
    );

    await expect(
      gateway.findLiveRegistrationCandidates("gabinho")
    ).resolves.toEqual({
      ok: true,
      data: [
        {
          roomId: "00000000-0000-4000-8000-000000000001",
          roomName: "Main Room",
          roomPlayerId: 3,
          playerName: "gabinho",
          team: "SPECTATORS",
          gameStatus: "PLAYING",
          sessionKind: "SIGNED_IN"
        }
      ]
    });

    expect(queryVariables).toEqual({ playerName: "gabinho" });
    expect(queryDocument).toEqual(expect.any(String));
    expect(queryDocument).not.toContain("name: { eq: $playerName }");
    expect(queryDocument).toMatch(/name: \{ equals: \$playerName \}/g);
    expect(
      (queryDocument as string).match(/name: \{ equals: \$playerName \}/g)
    ).toHaveLength(2);
  });
});

function apiSuccess<T>(data: T): ApiSuccess<T> {
  return {
    ok: true,
    data,
    response: {
      status: 200,
      statusText: "OK",
      url: "http://localhost/graphql/live",
      headers: new Headers()
    }
  };
}
