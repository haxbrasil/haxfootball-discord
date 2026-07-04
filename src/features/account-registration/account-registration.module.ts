import type { BotModule } from "../../core/bot-module";
import { confirmLiveRegistrationHandler } from "./discord/confirm-live-registration";
import { registrationPanelCommand } from "./discord/commands";
import { openPasswordResetModalHandler } from "./discord/open-password-reset-modal";
import { openRegistrationModalHandler } from "./discord/open-registration-modal";
import { postRegistrationPanelHandler } from "./discord/post-registration-panel";
import { submitPasswordResetModalHandler } from "./discord/submit-password-reset-modal";
import { submitRegistrationModalHandler } from "./discord/submit-registration-modal";

export function createAccountRegistrationModule(): BotModule {
  return {
    name: "account-registration",
    commands: [registrationPanelCommand()],
    handlers: [
      postRegistrationPanelHandler,
      openRegistrationModalHandler,
      submitRegistrationModalHandler,
      confirmLiveRegistrationHandler,
      openPasswordResetModalHandler,
      submitPasswordResetModalHandler
    ]
  };
}
