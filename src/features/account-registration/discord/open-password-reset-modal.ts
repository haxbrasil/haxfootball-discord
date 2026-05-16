import type { InteractionHandler } from "../../../core/interaction-router";
import { passwordResetModal } from "./components";
import { accountRegistrationIds } from "./custom-ids";

export const openPasswordResetModalHandler: InteractionHandler = {
  name: "account-registration.open-password-reset-modal",
  matches(interaction) {
    return (
      interaction.isButton() &&
      interaction.customId ===
        accountRegistrationIds.openPasswordResetModalButton
    );
  },
  async execute(interaction) {
    if (!interaction.isButton()) {
      return;
    }

    await interaction.showModal(passwordResetModal());
  }
};
