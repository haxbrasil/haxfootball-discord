import { type Interaction, MessageFlags } from "discord.js";
import type { AppContext } from "./app-context";
import { discordMessages } from "../discord/messages";

export type InteractionHandler = {
  name: string;
  matches(interaction: Interaction): boolean;
  execute(interaction: Interaction, context: AppContext): Promise<void>;
};

export function createInteractionRouter(handlers: InteractionHandler[]) {
  return {
    async handle(
      interaction: Interaction,
      context: AppContext
    ): Promise<boolean> {
      const handler = handlers.find((candidate) =>
        candidate.matches(interaction)
      );

      if (!handler) {
        return false;
      }

      try {
        await handler.execute(interaction, context);
      } catch (error) {
        context.logger.error("Discord interaction failed", {
          handler: handler.name,
          error
        });

        if (
          interaction.isRepliable() &&
          !interaction.replied &&
          !interaction.deferred
        ) {
          await interaction.reply({
            content: discordMessages.unexpectedError(),
            flags: MessageFlags.Ephemeral
          });
        }
      }

      return true;
    }
  };
}
