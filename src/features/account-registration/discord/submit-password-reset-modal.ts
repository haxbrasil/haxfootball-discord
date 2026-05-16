import { MessageFlags } from "discord.js";
import type { InteractionHandler } from "../../../core/interaction-router";
import { resetPassword } from "../application/reset-password";
import { accountRegistrationIds } from "./custom-ids";
import { passwordResetReplyMessage } from "./messages";

export const submitPasswordResetModalHandler: InteractionHandler = {
  name: "account-registration.submit-password-reset-modal",
  matches(interaction) {
    return (
      interaction.isModalSubmit() &&
      interaction.customId === accountRegistrationIds.submitPasswordResetModal
    );
  },
  async execute(interaction, context) {
    if (!interaction.isModalSubmit()) {
      return;
    }

    const result = await resetPassword(
      context.haxFootball.accountRegistration,
      {
        discordUserId: interaction.user.id,
        password: interaction.fields.getTextInputValue(
          accountRegistrationIds.newPasswordInput
        )
      }
    );

    await interaction.reply({
      content: passwordResetReplyMessage(result),
      flags: MessageFlags.Ephemeral
    });
  }
};
