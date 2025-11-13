export const RedisKeys = {
	BlacklistedUsers: 'blacklist:users',
	BlacklistedGuilds: 'blacklist:guilds',
	RoboChimpUser: (id: bigint) => `robochimp:user:${id.toString()}`,
	OSB: {
		User: {
			BadgedUsername: (id: string) => `osb:user:${id.toString()}:badged_username`,
			LockStatus: (id: string) => `osb:user:${id.toString()}:lock_status`,
			Ratelimit: (id: string, type: string) => `osb:user:${id.toString()}:ratelimit:${type}`
		},
		GuildSettings: (id: string) => `osb:guild:${id.toString()}:settings`,
		DisabledCommands: 'osb:disabled_commands'
	},
	BSO: {
		User: {
			BadgedUsername: (id: string) => `bso:user:${id.toString()}:badged_username`,
			LockStatus: (id: string) => `bso:user:${id.toString()}:lock_status`,
			Ratelimit: (id: string, type: string) => `bso:user:${id.toString()}:ratelimit:${type}`
		},
		GuildSettings: (id: string) => `bso:guild:${id.toString()}:settings`,
		DisabledCommands: 'bso:disabled_commands'
	},
	Discord: {
		Channel: (id: string) => `discord:channel:${id.toString()}`,
		Guild: (id: string) => `discord:guild:${id.toString()}`,
		Member: (guildId: string, userId: string) => `discord:guild:${guildId}:member:${userId}`,
		Role: (guildId: string, roleId: string) => `discord:guild:${guildId}:role:${roleId}`,
		Emoji: (guildId: string, emojiId: string) => `discord:guild:${guildId}:emoji:${emojiId}`,
		Username: (id: string) => `discord:user:${id.toString()}:username`
	}
} as const;
