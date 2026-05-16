import type { Interaction } from "discord.js";
import { describe, expect, it, vi } from "vitest";
import type { AppContext } from "../src/core/app-context";
import { createInteractionRouter } from "../src/core/interaction-router";

describe("createInteractionRouter", () => {
  it("routes the first matching handler", async () => {
    const execute = vi.fn();
    const router = createInteractionRouter([
      {
        name: "skip",
        matches: () => false,
        execute: vi.fn()
      },
      {
        name: "match",
        matches: () => true,
        execute
      }
    ]);

    await expect(
      router.handle(fakeInteraction(), contextFixture())
    ).resolves.toBe(true);
    expect(execute).toHaveBeenCalledOnce();
  });

  it("returns false when no handler matches", async () => {
    const router = createInteractionRouter([
      {
        name: "skip",
        matches: () => false,
        execute: vi.fn()
      }
    ]);

    await expect(
      router.handle(fakeInteraction(), contextFixture())
    ).resolves.toBe(false);
  });

  it("sends a generic ephemeral reply on handler failure", async () => {
    const reply = vi.fn();
    const logger = {
      error: vi.fn(),
      info: vi.fn(),
      warn: vi.fn()
    };
    const router = createInteractionRouter([
      {
        name: "broken",
        matches: () => true,
        async execute() {
          throw new Error("boom");
        }
      }
    ]);

    await expect(
      router.handle(
        fakeInteraction({
          isRepliable: () => true,
          replied: false,
          deferred: false,
          reply
        }),
        contextFixture({ logger })
      )
    ).resolves.toBe(true);

    expect(logger.error).toHaveBeenCalledOnce();
    expect(reply).toHaveBeenCalledWith(
      expect.objectContaining({
        content: "Something went wrong. Try again later."
      })
    );
  });
});

function fakeInteraction(overrides: Record<string, unknown> = {}): Interaction {
  return {
    isRepliable: () => false,
    replied: false,
    deferred: false,
    ...overrides
  } as Interaction;
}

function contextFixture(overrides: Partial<AppContext> = {}): AppContext {
  return {
    haxFootball: {
      accountRegistration: {
        async createAccount() {
          throw new Error("not implemented");
        },
        async resetPassword() {
          throw new Error("not implemented");
        }
      }
    },
    logger: {
      error: vi.fn(),
      info: vi.fn(),
      warn: vi.fn()
    },
    ...overrides
  };
}
