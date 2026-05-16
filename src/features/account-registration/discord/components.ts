import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  TextInputStyle,
  type MessageCreateOptions
} from "discord.js";
import {
  LabelBuilder,
  ModalBuilder,
  TextInputBuilder
} from "@discordjs/builders";
import { accountRegistrationIds } from "./custom-ids";
import { accountRegistrationMessages } from "./messages";

export type RegistrationPanelOptions = {
  title?: string | null;
  description?: string | null;
  buttonLabel?: string | null;
  passwordResetButtonLabel?: string | null;
  color?: number | null;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
};

const defaultPanelColor = 0x1f8b4c;

export function registrationPanelMessage(
  options: RegistrationPanelOptions = {}
): MessageCreateOptions {
  const embed = new EmbedBuilder()
    .setTitle(options.title ?? accountRegistrationMessages.panelTitle())
    .setDescription(
      options.description ?? accountRegistrationMessages.panelContent()
    )
    .setColor(options.color ?? defaultPanelColor);

  if (options.imageUrl) {
    embed.setImage(options.imageUrl);
  }

  if (options.thumbnailUrl) {
    embed.setThumbnail(options.thumbnailUrl);
  }

  return {
    embeds: [embed],
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(accountRegistrationIds.openModalButton)
          .setLabel(
            options.buttonLabel ?? accountRegistrationMessages.panelButton()
          )
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(accountRegistrationIds.openPasswordResetModalButton)
          .setLabel(
            options.passwordResetButtonLabel ??
              accountRegistrationMessages.panelPasswordResetButton()
          )
          .setStyle(ButtonStyle.Secondary)
      )
    ]
  };
}

export function passwordResetModal(): ModalBuilder {
  return new ModalBuilder()
    .setCustomId(accountRegistrationIds.submitPasswordResetModal)
    .setTitle(accountRegistrationMessages.passwordResetModalTitle())
    .addLabelComponents(
      new LabelBuilder()
        .setLabel(accountRegistrationMessages.passwordResetModalPasswordLabel())
        .setTextInputComponent(
          new TextInputBuilder()
            .setCustomId(accountRegistrationIds.newPasswordInput)
            .setStyle(TextInputStyle.Short)
            .setMinLength(4)
            .setMaxLength(19)
            .setRequired(true)
        )
    );
}

export function registrationModal(): ModalBuilder {
  return new ModalBuilder()
    .setCustomId(accountRegistrationIds.submitModal)
    .setTitle(accountRegistrationMessages.modalTitle())
    .addLabelComponents(
      new LabelBuilder()
        .setLabel(accountRegistrationMessages.modalNameLabel())
        .setTextInputComponent(
          new TextInputBuilder()
            .setCustomId(accountRegistrationIds.nameInput)
            .setStyle(TextInputStyle.Short)
            .setMinLength(1)
            .setMaxLength(25)
            .setRequired(true)
        ),
      new LabelBuilder()
        .setLabel(accountRegistrationMessages.modalPasswordLabel())
        .setTextInputComponent(
          new TextInputBuilder()
            .setCustomId(accountRegistrationIds.passwordInput)
            .setStyle(TextInputStyle.Short)
            .setMinLength(4)
            .setMaxLength(19)
            .setRequired(true)
        )
    );
}
