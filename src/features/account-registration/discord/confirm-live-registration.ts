import type { InteractionHandler } from "../../../core/interaction-router";
import { parseLiveRegistrationButtonId } from "./custom-ids";
import {
  liveRegistrationConfirmedMessage,
  liveRegistrationConfirmingMessage,
  liveRegistrationDeclinedMessage,
  liveRegistrationFailureMessage
} from "./messages";

export const confirmLiveRegistrationHandler: InteractionHandler = {
  name: "account-registration.confirm-live-registration",
  matches(interaction) {
    return (
      interaction.isButton() &&
      parseLiveRegistrationButtonId(interaction.customId) !== null
    );
  },
  async execute(interaction, context) {
    if (!interaction.isButton()) {
      return;
    }

    const input = parseLiveRegistrationButtonId(interaction.customId);

    if (!input) {
      return;
    }

    if (input.action === "decline") {
      await interaction.update({
        content: liveRegistrationDeclinedMessage(),
        components: []
      });
      return;
    }

    await interaction.update({
      content: liveRegistrationConfirmingMessage(),
      components: []
    });

    const result =
      await context.haxFootball.accountRegistration.confirmLiveRegistration({
        discordUserId: interaction.user.id,
        roomId: input.roomId,
        roomPlayerId: input.roomPlayerId
      });

    await interaction.editReply({
      content: result.ok
        ? liveRegistrationConfirmedMessage(result.data)
        : liveRegistrationFailureMessage(result.error),
      components: []
    });
  }
};
