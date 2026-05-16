import {
  type ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits
} from "discord.js";
import type { InteractionHandler } from "../../../core/interaction-router";
import { accountRegistrationIds } from "./custom-ids";
import {
  registrationPanelMessage,
  type RegistrationPanelOptions
} from "./components";
import { accountRegistrationMessages } from "./messages";

type SendableChannel = {
  send(options: unknown): Promise<unknown>;
};

export const postRegistrationPanelHandler: InteractionHandler = {
  name: "account-registration.post-panel",
  matches(interaction) {
    return (
      interaction.isChatInputCommand() &&
      interaction.commandName ===
        accountRegistrationIds.postPanelCommand.command &&
      interaction.options.getSubcommand() ===
        accountRegistrationIds.postPanelCommand.subcommand
    );
  },
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) {
      return;
    }

    if (
      !interaction.inGuild() ||
      !interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)
    ) {
      await interaction.reply({
        content: accountRegistrationMessages.permissionDenied(),
        flags: MessageFlags.Ephemeral
      });

      return;
    }

    if (!isSendableChannel(interaction.channel)) {
      await interaction.reply({
        content: accountRegistrationMessages.unsupportedChannel(),
        flags: MessageFlags.Ephemeral
      });

      return;
    }

    await interaction.channel.send(
      registrationPanelMessage(registrationPanelOptions(interaction))
    );
    await interaction.reply({
      content: accountRegistrationMessages.panelPosted(),
      flags: MessageFlags.Ephemeral
    });
  }
};

function isSendableChannel(channel: unknown): channel is SendableChannel {
  return (
    !!channel &&
    typeof channel === "object" &&
    "send" in channel &&
    typeof channel.send === "function"
  );
}

function registrationPanelOptions(
  interaction: ChatInputCommandInteraction
): RegistrationPanelOptions {
  return {
    title: interaction.options.getString("title"),
    description: interaction.options.getString("description"),
    buttonLabel: interaction.options.getString("button_label"),
    passwordResetButtonLabel: interaction.options.getString(
      "forgot_password_button_label"
    ),
    color: parseHexColor(interaction.options.getString("color")),
    imageUrl: interaction.options.getString("image_url"),
    thumbnailUrl: interaction.options.getString("thumbnail_url")
  };
}

function parseHexColor(input: string | null): number | null {
  if (!input) {
    return null;
  }

  const normalized = input.trim().replace(/^#/, "");

  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return null;
  }

  return Number.parseInt(normalized, 16);
}
