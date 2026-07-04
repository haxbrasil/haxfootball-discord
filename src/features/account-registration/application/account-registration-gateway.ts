import type { Account, ApiFailure } from "@haxbrasil/haxfootball-api-sdk";
import type { Result } from "../../../core/result";

export type AccountRegistrationGateway = {
  createAccount(
    input: RegisterAccountInput
  ): Promise<Result<Account, ApiFailure>>;
  findLiveRegistrationCandidates(
    accountName: string
  ): Promise<Result<LiveRegistrationCandidate[], ApiFailure>>;
  confirmLiveRegistration(
    input: ConfirmLiveRegistrationInput
  ): Promise<Result<LiveRegistrationCommand, LiveRegistrationFailure>>;
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

export type LiveRegistrationCandidate = {
  roomId: string;
  roomName: string | null;
  roomPlayerId: number;
  playerName: string;
  team: string;
  gameStatus: string;
  sessionKind: string | null;
};

export type ConfirmLiveRegistrationInput = {
  discordUserId: string;
  roomId: string;
  roomPlayerId: number;
};

export type LiveRegistrationCommand = {
  id: string;
  roomId: string;
  name: string;
  status: string;
};

export type AccountNotFoundFailure = {
  kind: "account_not_found";
};

export type LiveRegistrationCandidateNotFoundFailure = {
  kind: "live_registration_candidate_not_found";
};

export type LiveRegistrationRejectedFailure = {
  kind: "live_registration_rejected";
  message: string;
};

export type LiveRegistrationFailure =
  | ApiFailure
  | AccountNotFoundFailure
  | LiveRegistrationCandidateNotFoundFailure
  | LiveRegistrationRejectedFailure;

export type AccountPasswordResetFailure = ApiFailure | AccountNotFoundFailure;
