import type { Logger } from "./logger";
import type { AccountRegistrationGateway } from "../features/account-registration/application/account-registration-gateway";
import type { DiscordPermissionGateway } from "../features/discord-permissions/application/discord-permission-gateway";

export type HaxFootballServices = {
  accountRegistration: AccountRegistrationGateway;
  discordPermissions: DiscordPermissionGateway;
};

export type AppContext = {
  haxFootball: HaxFootballServices;
  logger: Logger;
};
