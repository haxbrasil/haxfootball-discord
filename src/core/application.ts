import type { Client } from "discord.js";
import { Events } from "discord.js";
import type { AppContext } from "./app-context";
import type { BotModule } from "./bot-module";
import { createInteractionRouter } from "./interaction-router";

export type BotApplication = {
  commands: BotModule["commands"];
  bind(client: Client): void;
};

export function createBotApplication(
  modules: BotModule[],
  context: AppContext
): BotApplication {
  const commands = modules.flatMap((module) => module.commands);
  const handlers = modules.flatMap((module) => module.handlers);
  const router = createInteractionRouter(handlers);

  return {
    commands,
    bind(client) {
      client.on(Events.InteractionCreate, async (interaction) => {
        await router.handle(interaction, context);
      });
    }
  };
}
