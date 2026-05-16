import type { Account } from "@haxbrasil/haxfootball-api-sdk";
import type { Result } from "../../../core/result";
import type {
  AccountRegistrationGateway,
  AccountPasswordResetFailure,
  ResetPasswordInput
} from "./account-registration-gateway";

export type ResetPasswordFailure =
  | "account_not_found"
  | "invalid_input"
  | "unauthorized"
  | "unavailable";

export type ResetPasswordResult = Result<Account, ResetPasswordFailure>;

export async function resetPassword(
  gateway: AccountRegistrationGateway,
  input: ResetPasswordInput
): Promise<ResetPasswordResult> {
  const result = await gateway.resetPassword({
    discordUserId: input.discordUserId,
    password: input.password
  });

  if (result.ok) {
    return result;
  }

  return {
    ok: false,
    error: mapResetPasswordFailure(result.error)
  };
}

function mapResetPasswordFailure(
  error: AccountPasswordResetFailure
): ResetPasswordFailure {
  if (error.kind === "account_not_found") {
    return "account_not_found";
  }

  if (error.kind !== "api") {
    return "unavailable";
  }

  if (error.status === 401 || error.code === "UNAUTHORIZED") {
    return "unauthorized";
  }

  if (error.status === 400 || error.code === "VALIDATION_ERROR") {
    return "invalid_input";
  }

  return "unavailable";
}
