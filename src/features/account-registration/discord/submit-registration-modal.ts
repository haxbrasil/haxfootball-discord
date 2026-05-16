import { MessageFlags } from "discord.js";
import type { InteractionHandler } from "../../../core/interaction-router";
import { registerAccount } from "../application/register-account";
import { accountRegistrationIds } from "./custom-ids";
import { registrationReplyMessage } from "./messages";

export const submitRegistrationModalHandler: InteractionHandler = {
  name: "account-registration.submit-modal",
  matches(interaction) {
    return (
      interaction.isModalSubmit() &&
      interaction.customId === accountRegistrationIds.submitModal
    );
  },
  async execute(interaction, context) {
    if (!interaction.isModalSubmit()) {
      return;
    }

    const result = await registerAccount(
      context.haxFootball.accountRegistration,
      {
        discordUserId: interaction.user.id,
        name: interaction.fields.getTextInputValue(
          accountRegistrationIds.nameInput
        ),
        password: interaction.fields.getTextInputValue(
          accountRegistrationIds.passwordInput
        )
      }
    );

    await interaction.reply({
      content: registrationReplyMessage(result),
      flags: MessageFlags.Ephemeral
    });
  }
};
