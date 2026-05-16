import type { ApiFailure } from "@haxbrasil/haxfootball-api-sdk";
import type { Result } from "../../../core/result";
import type { DiscordPermission } from "../domain/discord-permissions";

export type DiscordPermissionGateway = {
  hasPermission(
    input: DiscordPermissionCheckInput
  ): Promise<Result<boolean, ApiFailure>>;
};

export type DiscordPermissionCheckInput = {
  discordUserId: string;
  permission: DiscordPermission;
};
