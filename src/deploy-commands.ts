import { REST, Routes } from "discord.js";
import type { Config } from "./config";
import type { BotApplication } from "./core/application";

export async function deployGuildCommands(
  config: Config,
  application: BotApplication
): Promise<void> {
  const rest = new REST({ version: "10" }).setToken(config.discordBotToken);

  await rest.put(
    Routes.applicationGuildCommands(
      config.discordClientId,
      config.discordGuildId
    ),
    {
      body: application.commands
    }
  );
}
