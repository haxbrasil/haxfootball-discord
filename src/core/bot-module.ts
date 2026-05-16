import type { RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js";
import type { InteractionHandler } from "./interaction-router";

export type BotModule = {
  name: string;
  commands: RESTPostAPIChatInputApplicationCommandsJSONBody[];
  handlers: InteractionHandler[];
};
