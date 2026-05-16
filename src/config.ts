import { z } from "zod";

const envSchema = z.object({
  DISCORD_BOT_TOKEN: z.string().min(1),
  DISCORD_CLIENT_ID: z.string().min(1),
  DISCORD_GUILD_ID: z.string().min(1),
  HAXFOOTBALL_API_URL: z.string().url(),
  HAXFOOTBALL_API_KEY: z.string().min(1)
});

export type Config = {
  discordBotToken: string;
  discordClientId: string;
  discordGuildId: string;
  haxFootballApiUrl: string;
  haxFootballApiKey: string;
};

export function readConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const parsed = envSchema.parse(env);

  return {
    discordBotToken: parsed.DISCORD_BOT_TOKEN,
    discordClientId: parsed.DISCORD_CLIENT_ID,
    discordGuildId: parsed.DISCORD_GUILD_ID,
    haxFootballApiUrl: parsed.HAXFOOTBALL_API_URL,
    haxFootballApiKey: parsed.HAXFOOTBALL_API_KEY
  };
}
