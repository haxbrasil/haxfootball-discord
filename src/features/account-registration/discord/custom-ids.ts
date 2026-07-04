export const accountRegistrationIds = {
  postPanelCommand: {
    command: "admin",
    subcommand: "registration-panel"
  },
  openModalButton: "account-registration.open",
  openPasswordResetModalButton: "account-registration.password-reset.open",
  submitModal: "account-registration.submit",
  submitPasswordResetModal: "account-registration.password-reset.submit",
  confirmLiveRegistrationButton: "account-registration.live.confirm",
  declineLiveRegistrationButton: "account-registration.live.decline",
  nameInput: "account-registration.name",
  passwordInput: "account-registration.password",
  newPasswordInput: "account-registration.password-reset.password"
} as const;

export type LiveRegistrationAction = "confirm" | "decline";

export function liveRegistrationButtonId(input: {
  action: LiveRegistrationAction;
  roomId: string;
  roomPlayerId: number;
}): string {
  const actionId =
    input.action === "confirm"
      ? accountRegistrationIds.confirmLiveRegistrationButton
      : accountRegistrationIds.declineLiveRegistrationButton;

  return `${actionId}:${input.roomId}:${input.roomPlayerId}`;
}

export function parseLiveRegistrationButtonId(customId: string): {
  action: LiveRegistrationAction;
  roomId: string;
  roomPlayerId: number;
} | null {
  const confirmPrefix = `${accountRegistrationIds.confirmLiveRegistrationButton}:`;
  const declinePrefix = `${accountRegistrationIds.declineLiveRegistrationButton}:`;
  const action = customId.startsWith(confirmPrefix)
    ? "confirm"
    : customId.startsWith(declinePrefix)
      ? "decline"
      : null;

  if (!action) {
    return null;
  }

  const prefix = action === "confirm" ? confirmPrefix : declinePrefix;
  const [roomId, roomPlayerIdText] = customId.slice(prefix.length).split(":");
  const roomPlayerId = Number(roomPlayerIdText);

  if (!roomId || !Number.isInteger(roomPlayerId) || roomPlayerId < 0) {
    return null;
  }

  return { action, roomId, roomPlayerId };
}
