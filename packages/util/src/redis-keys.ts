export const RedisKeys = {
	BlacklistedUsers: 'blacklist:users',
	BlacklistedGuilds: 'blacklist:guilds',
	RoboChimpUser: (id: bigint): string => `robochimp:user:${id.toString()}`,
	OSB: {
		User: {
			BadgedUsername: (id: string): string => `osb:user:${id.toString()}:badged_username`,
			LockStatus: (id: string): string => `osb:user:${id.toString()}:lock_status`,
			Ratelimit: (id: string, type: string): string => `osb:user:${id.toString()}:ratelimit:${type}`
		},
		GuildSettings: (id: string): string => `osb:guild:${id.toString()}:settings`,
		DisabledCommands: 'osb:disabled_commands',
		Webhook: (channelId: string): string => `osb:webhook:${channelId}`
	},
	BSO: {
		User: {
			BadgedUsername: (id: string): string => `bso:user:${id.toString()}:badged_username`,
			LockStatus: (id: string): string => `bso:user:${id.toString()}:lock_status`,
			Ratelimit: (id: string, type: string): string => `bso:user:${id.toString()}:ratelimit:${type}`
		},
		GuildSettings: (id: string): string => `bso:guild:${id.toString()}:settings`,
		DisabledCommands: 'bso:disabled_commands',
		Webhook: (channelId: string): string => `bso:webhook:${channelId}`
	},
	Discord: {
		Channel: (id: string): string => `discord:channel:${id.toString()}`,
		Guild: (id: string): string => `discord:guild:${id.toString()}`,
		Member: (guildId: string, userId: string): string => `discord:guild:${guildId}:member:${userId}`,
		Role: (guildId: string, roleId: string): string => `discord:guild:${guildId}:role:${roleId}`,
		Emoji: (guildId: string, emojiId: string): string => `discord:guild:${guildId}:emoji:${emojiId}`,
		Username: (id: string): string => `discord:user:${id.toString()}:username`
	}
} as const;
