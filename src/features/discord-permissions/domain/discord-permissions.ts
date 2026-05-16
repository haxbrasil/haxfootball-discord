export const discordPermissions = {
  mod: "discord:mod",
  manager: "discord:manager",
  all: "discord:all"
} as const;

export type DiscordPermission =
  (typeof discordPermissions)[keyof typeof discordPermissions];

export function hasDiscordPermission(
  permissions: string[],
  permission: DiscordPermission
): boolean {
  return (
    permissions.includes(discordPermissions.all) ||
    permissions.includes(permission)
  );
}
