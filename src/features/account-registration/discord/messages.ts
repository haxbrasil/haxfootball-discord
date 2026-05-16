import { t } from "@lingui/core/macro";
import type { RegisterAccountResult } from "../application/register-account";
import type { ResetPasswordResult } from "../application/reset-password";

export const accountRegistrationMessages = {
  panelContent: () =>
    t({
      id: "discord.accountRegistration.panel.content",
      message:
        "Click the button below to create your BFL account and link it to Discord."
    }),
  panelTitle: () =>
    t({
      id: "discord.accountRegistration.panel.title",
      message: "BFL Account Registration"
    }),
  panelButton: () =>
    t({
      id: "discord.accountRegistration.panel.button",
      message: "Register account"
    }),
  panelPasswordResetButton: () =>
    t({
      id: "discord.accountRegistration.panel.passwordResetButton",
      message: "Forgot my password"
    }),
  modalTitle: () =>
    t({
      id: "discord.accountRegistration.modal.title",
      message: "Register account"
    }),
  modalNameLabel: () =>
    t({
      id: "discord.accountRegistration.modal.name.label",
      message: "Account name"
    }),
  modalPasswordLabel: () =>
    t({
      id: "discord.accountRegistration.modal.password.label",
      message: "Password"
    }),
  passwordResetModalTitle: () =>
    t({
      id: "discord.accountRegistration.passwordReset.modal.title",
      message: "Change password"
    }),
  passwordResetModalPasswordLabel: () =>
    t({
      id: "discord.accountRegistration.passwordReset.modal.password.label",
      message: "New password"
    }),
  adminCommandDescription: () =>
    t({
      id: "discord.accountRegistration.command.admin.description",
      message: "BFL admin tools"
    }),
  registrationPanelCommandDescription: () =>
    t({
      id: "discord.accountRegistration.command.panel.description",
      message: "Post the account registration panel"
    }),
  permissionDenied: () =>
    t({
      id: "discord.accountRegistration.admin.permissionDenied",
      message: "You do not have permission to post the registration panel."
    }),
  unsupportedChannel: () =>
    t({
      id: "discord.accountRegistration.admin.unsupportedChannel",
      message: "This channel cannot receive the registration panel."
    }),
  panelPosted: () =>
    t({
      id: "discord.accountRegistration.admin.panelPosted",
      message: "Registration panel posted."
    })
};

export function registrationReplyMessage(
  result: RegisterAccountResult
): string {
  if (result.ok) {
    const name = result.data.name;

    return t({
      id: "discord.accountRegistration.created",
      message: `Account registered as ${{ name }}.`
    });
  }

  switch (result.error) {
    case "name_taken":
      return t({
        id: "discord.accountRegistration.nameTaken",
        message: "That account name is already taken."
      });
    case "discord_account_taken":
      return t({
        id: "discord.accountRegistration.discordAccountTaken",
        message: "Your Discord account is already linked to a BFL account."
      });
    case "invalid_input":
      return t({
        id: "discord.accountRegistration.invalidInput",
        message:
          "Invalid account name or password. Names must be 1-25 characters, and passwords must be 4-19 characters."
      });
    case "unauthorized":
      return t({
        id: "discord.accountRegistration.unauthorized",
        message: "Registration is not configured correctly. Contact an admin."
      });
    case "unavailable":
      return t({
        id: "discord.accountRegistration.unavailable",
        message: "Registration is temporarily unavailable. Try again later."
      });
  }
}

export function passwordResetReplyMessage(result: ResetPasswordResult): string {
  if (result.ok) {
    return t({
      id: "discord.accountRegistration.passwordReset.updated",
      message: "Password updated."
    });
  }

  switch (result.error) {
    case "account_not_found":
      return t({
        id: "discord.accountRegistration.passwordReset.accountNotFound",
        message: "Your Discord account is not linked to a BFL account yet."
      });
    case "invalid_input":
      return t({
        id: "discord.accountRegistration.passwordReset.invalidInput",
        message: "Invalid password. Passwords must be 4-19 characters."
      });
    case "unauthorized":
      return t({
        id: "discord.accountRegistration.passwordReset.unauthorized",
        message: "Password reset is not configured correctly. Contact an admin."
      });
    case "unavailable":
      return t({
        id: "discord.accountRegistration.passwordReset.unavailable",
        message: "Password reset is temporarily unavailable. Try again later."
      });
  }
}
