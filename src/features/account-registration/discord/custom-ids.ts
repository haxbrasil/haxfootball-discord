export const accountRegistrationIds = {
  postPanelCommand: {
    command: "admin",
    subcommand: "registration-panel"
  },
  openModalButton: "account-registration.open",
  openPasswordResetModalButton: "account-registration.password-reset.open",
  submitModal: "account-registration.submit",
  submitPasswordResetModal: "account-registration.password-reset.submit",
  nameInput: "account-registration.name",
  passwordInput: "account-registration.password",
  newPasswordInput: "account-registration.password-reset.password"
} as const;
