import type { InteractionHandler } from "../../../core/interaction-router";
import { registrationModal } from "./components";
import { accountRegistrationIds } from "./custom-ids";

export const openRegistrationModalHandler: InteractionHandler = {
  name: "account-registration.open-modal",
  matches(interaction) {
    return (
      interaction.isButton() &&
      interaction.customId === accountRegistrationIds.openModalButton
    );
  },
  async execute(interaction) {
    if (!interaction.isButton()) {
      return;
    }

    await interaction.showModal(registrationModal());
  }
};
