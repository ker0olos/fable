export const usersByDiscordId = (
  discordId: string,
) => ['users_by_discord_id', discordId];

export const usersLikesByDiscordId = (
  discordId: string,
) => ['users_likes_by_discord_id', discordId];

export const guildsByDiscordId = (
  discordId: string,
) => ['guilds_by_discord_id', discordId];

export const inventoriesByInstance = (
  instanceId: string,
) => ['inventories_by_instance_user', instanceId];

export const inventoriesByUser = (
  instanceId: string,
  userId: string,
) => ['inventories_by_instance_user', instanceId, userId];

export const charactersByInstancePrefix = (
  instanceId: string,
) => ['characters_by_instance_fid', instanceId];

export const charactersByInventoryPrefix = (
  inventoryId: string,
) => ['characters_by_inventory', inventoryId];

export const charactersByMediaIdPrefix = (
  instanceId: string,
  mediaId: string,
) => ['characters_by_media_instance', instanceId, mediaId];

export const packsByManifestId = (
  manifestId: string,
) => ['packs_by_manifest_id', manifestId];
