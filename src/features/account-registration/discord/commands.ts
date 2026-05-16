import {
  SlashCommandBuilder,
  type RESTPostAPIChatInputApplicationCommandsJSONBody
} from "discord.js";
import { accountRegistrationIds } from "./custom-ids";
import { accountRegistrationMessages } from "./messages";

export function registrationPanelCommand(): RESTPostAPIChatInputApplicationCommandsJSONBody {
  return new SlashCommandBuilder()
    .setName(accountRegistrationIds.postPanelCommand.command)
    .setDescription(accountRegistrationMessages.adminCommandDescription())
    .addSubcommand((subcommand) =>
      subcommand
        .setName(accountRegistrationIds.postPanelCommand.subcommand)
        .setDescription(
          accountRegistrationMessages.registrationPanelCommandDescription()
        )
        .addStringOption((option) =>
          option
            .setName("title")
            .setDescription("Custom embed title")
            .setMaxLength(256)
        )
        .addStringOption((option) =>
          option
            .setName("description")
            .setDescription("Custom embed description")
            .setMaxLength(4000)
        )
        .addStringOption((option) =>
          option
            .setName("button_label")
            .setDescription("Custom registration button label")
            .setMaxLength(80)
        )
        .addStringOption((option) =>
          option
            .setName("forgot_password_button_label")
            .setDescription("Custom forgot password button label")
            .setMaxLength(80)
        )
        .addStringOption((option) =>
          option
            .setName("color")
            .setDescription("Embed color as hex, for example #00AEEF")
            .setMaxLength(7)
        )
        .addStringOption((option) =>
          option
            .setName("image_url")
            .setDescription("Optional embed image URL")
            .setMaxLength(2048)
        )
        .addStringOption((option) =>
          option
            .setName("thumbnail_url")
            .setDescription("Optional embed thumbnail URL")
            .setMaxLength(2048)
        )
    )
    .toJSON();
}
