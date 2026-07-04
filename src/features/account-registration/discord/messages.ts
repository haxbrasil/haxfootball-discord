import { t } from "@lingui/core/macro";
import type {
  LiveRegistrationCandidate,
  LiveRegistrationCommand,
  LiveRegistrationFailure
} from "../application/account-registration-gateway";
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
    }),
  liveConfirmationYesButton: () =>
    t({
      id: "discord.accountRegistration.liveConfirmation.yesButton",
      message: "Yes, this is me"
    }),
  liveConfirmationNoButton: () =>
    t({
      id: "discord.accountRegistration.liveConfirmation.noButton",
      message: "No"
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

export function liveRegistrationPromptMessage(input: {
  accountName: string;
  candidate: LiveRegistrationCandidate;
  includeCreatedMessage: boolean;
}): string {
  const roomName = input.candidate.roomName ?? input.candidate.roomId;
  const playerName = input.candidate.playerName;

  if (input.includeCreatedMessage) {
    return t({
      id: "discord.accountRegistration.liveConfirmation.promptWithCreated",
      message: `Account registered as ${{ name: input.accountName }}.\nIs this you in ${{ roomName }} as ${{ playerName }}?`
    });
  }

  return t({
    id: "discord.accountRegistration.liveConfirmation.prompt",
    message: `Is this you in ${{ roomName }} as ${{ playerName }}?`
  });
}

export function liveRegistrationLookupUnavailableMessage(input: {
  accountName: string;
}): string {
  return t({
    id: "discord.accountRegistration.liveConfirmation.lookupUnavailable",
    message: `Account registered as ${{ name: input.accountName }}. I couldn't check live rooms right now.`
  });
}

export function liveRegistrationConfirmingMessage(): string {
  return t({
    id: "discord.accountRegistration.liveConfirmation.confirming",
    message: "Confirming your live room player..."
  });
}

export function liveRegistrationConfirmedMessage(
  command: LiveRegistrationCommand
): string {
  if (command.status !== "ACKNOWLEDGED") {
    return t({
      id: "discord.accountRegistration.liveConfirmation.sent",
      message:
        "Confirmation sent to the room. If you are still blocked, try again in a moment."
    });
  }

  return t({
    id: "discord.accountRegistration.liveConfirmation.confirmed",
    message: "Confirmed. You are signed in inside the room."
  });
}

export function liveRegistrationDeclinedMessage(): string {
  return t({
    id: "discord.accountRegistration.liveConfirmation.declined",
    message: "Skipped this room."
  });
}

export function liveRegistrationFailureMessage(
  error: LiveRegistrationFailure
): string {
  if (error.kind === "account_not_found") {
    return t({
      id: "discord.accountRegistration.liveConfirmation.accountNotFound",
      message: "Your Discord account is not linked to a BFL account anymore."
    });
  }

  if (error.kind === "live_registration_candidate_not_found") {
    return t({
      id: "discord.accountRegistration.liveConfirmation.candidateNotFound",
      message: "I couldn't find that player in the live room anymore."
    });
  }

  if (error.kind === "live_registration_rejected") {
    return t({
      id: "discord.accountRegistration.liveConfirmation.rejected",
      message: "The room could not confirm that player anymore."
    });
  }

  return t({
    id: "discord.accountRegistration.liveConfirmation.unavailable",
    message:
      "Live room confirmation is temporarily unavailable. Try again later."
  });
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
