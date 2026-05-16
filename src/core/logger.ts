export type Logger = Pick<Console, "error" | "info" | "warn">;

export const consoleLogger: Logger = console;
