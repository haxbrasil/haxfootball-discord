import type { Logger } from "./logger";
import type { AccountRegistrationGateway } from "../features/account-registration/application/account-registration-gateway";

export type HaxFootballServices = {
  accountRegistration: AccountRegistrationGateway;
};

export type AppContext = {
  haxFootball: HaxFootballServices;
  logger: Logger;
};
