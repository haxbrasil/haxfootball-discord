import type { BotModule } from "./core/bot-module";
import { createAccountRegistrationModule } from "./features/account-registration/account-registration.module";

export function createModules(): BotModule[] {
  return [createAccountRegistrationModule()];
}
