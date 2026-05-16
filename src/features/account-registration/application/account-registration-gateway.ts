import type { Account, ApiFailure } from "@haxbrasil/haxfootball-api-sdk";
import type { Result } from "../../../core/result";

export type AccountRegistrationGateway = {
  createAccount(
    input: RegisterAccountInput
  ): Promise<Result<Account, ApiFailure>>;
  resetPassword(
    input: ResetPasswordInput
  ): Promise<Result<Account, AccountPasswordResetFailure>>;
};

export type RegisterAccountInput = {
  discordUserId: string;
  name: string;
  password: string;
};

export type ResetPasswordInput = {
  discordUserId: string;
  password: string;
};

export type AccountNotFoundFailure = {
  kind: "account_not_found";
};

export type AccountPasswordResetFailure = ApiFailure | AccountNotFoundFailure;
