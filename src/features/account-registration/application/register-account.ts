import type { Account, ApiFailure } from "@haxbrasil/haxfootball-api-sdk";
import type { Result } from "../../../core/result";
import type {
  AccountRegistrationGateway,
  RegisterAccountInput
} from "./account-registration-gateway";

export type RegisterAccountFailure =
  | "name_taken"
  | "discord_account_taken"
  | "invalid_input"
  | "unauthorized"
  | "unavailable";

export type RegisterAccountResult = Result<Account, RegisterAccountFailure>;

export async function registerAccount(
  gateway: AccountRegistrationGateway,
  input: RegisterAccountInput
): Promise<RegisterAccountResult> {
  const result = await gateway.createAccount({
    discordUserId: input.discordUserId,
    name: input.name.trim(),
    password: input.password
  });

  if (result.ok) {
    return result;
  }

  return {
    ok: false,
    error: mapRegistrationFailure(result.error)
  };
}

function mapRegistrationFailure(error: ApiFailure): RegisterAccountFailure {
  if (error.kind !== "api") {
    return "unavailable";
  }

  if (error.message === "Account name already exists") {
    return "name_taken";
  }

  if (error.message === "Account external ID already exists") {
    return "discord_account_taken";
  }

  if (error.status === 401 || error.code === "UNAUTHORIZED") {
    return "unauthorized";
  }

  if (error.status === 400 || error.code === "VALIDATION_ERROR") {
    return "invalid_input";
  }

  return "unavailable";
}
