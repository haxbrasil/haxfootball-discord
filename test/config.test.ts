import { describe, expect, it } from "vitest";
import { readConfig } from "../src/config";

describe("readConfig", () => {
  it("reads required environment variables", () => {
    expect(
      readConfig({
        DISCORD_BOT_TOKEN: "discord-token",
        DISCORD_CLIENT_ID: "client-id",
        DISCORD_GUILD_ID: "guild-id",
        HAXFOOTBALL_API_URL: "https://api.example.com/api",
        HAXFOOTBALL_API_KEY: "api-key"
      })
    ).toEqual({
      discordBotToken: "discord-token",
      discordClientId: "client-id",
      discordGuildId: "guild-id",
      haxFootballApiUrl: "https://api.example.com/api",
      haxFootballApiKey: "api-key"
    });
  });

  it("rejects missing environment variables", () => {
    expect(() => readConfig({})).toThrow();
  });
});
