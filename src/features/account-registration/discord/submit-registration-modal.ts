import { MessageFlags } from "discord.js";
import type { InteractionHandler } from "../../../core/interaction-router";
import { registerAccount } from "../application/register-account";
import { liveRegistrationConfirmationComponents } from "./components";
import { accountRegistrationIds } from "./custom-ids";
import {
  liveRegistrationLookupUnavailableMessage,
  liveRegistrationPromptMessage,
  registrationReplyMessage
} from "./messages";

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

    await interaction.deferReply({
      flags: MessageFlags.Ephemeral
    });

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

    if (!result.ok) {
      await interaction.editReply({
        content: registrationReplyMessage(result)
      });
      return;
    }

    const candidatesResult =
      await context.haxFootball.accountRegistration.findLiveRegistrationCandidates(
        result.data.name
      );

    if (!candidatesResult.ok) {
      await interaction.editReply({
        content: liveRegistrationLookupUnavailableMessage({
          accountName: result.data.name
        })
      });
      return;
    }

    if (candidatesResult.data.length === 0) {
      await interaction.editReply({
        content: registrationReplyMessage(result)
      });
      return;
    }

    const [firstCandidate, ...otherCandidates] = candidatesResult.data;

    await interaction.editReply({
      content: liveRegistrationPromptMessage({
        accountName: result.data.name,
        candidate: firstCandidate,
        includeCreatedMessage: true
      }),
      components: liveRegistrationConfirmationComponents(firstCandidate)
    });

    for (const candidate of otherCandidates) {
      await interaction.followUp({
        content: liveRegistrationPromptMessage({
          accountName: result.data.name,
          candidate,
          includeCreatedMessage: false
        }),
        components: liveRegistrationConfirmationComponents(candidate),
        flags: MessageFlags.Ephemeral
      });
    }
  }
};
