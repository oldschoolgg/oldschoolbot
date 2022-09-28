import { ClientOptions, GatewayIntentBits, Options, Partials } from 'discord.js';
import { Time } from 'e';

import { DEV_SERVER_ID, SupportServer } from '../config';
import { CACHED_ACTIVE_USER_IDS } from './util/cachedUserIDs';

export const clientOptions: ClientOptions = {
	shards: 'auto',
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.DirectMessageReactions,
		GatewayIntentBits.GuildWebhooks
	],
	partials: [Partials.User, Partials.Channel],
	allowedMentions: {
		parse: ['users']
	},
	makeCache: Options.cacheWithLimits({
		MessageManager: {
			maxSize: 100,
			keepOverLimit: msg => msg.author.id !== globalClient.user!.id && !msg.content
		},
		UserManager: {
			maxSize: 1000,
			keepOverLimit: user => CACHED_ACTIVE_USER_IDS.has(user.id)
		},
		GuildMemberManager: {
			maxSize: 200,
			keepOverLimit: member => CACHED_ACTIVE_USER_IDS.has(member.user.id)
		},
		// Useless props for the bot
		GuildEmojiManager: { maxSize: 0, keepOverLimit: i => [DEV_SERVER_ID, SupportServer].includes(i.guild.id) },
		GuildStickerManager: { maxSize: 0 },
		PresenceManager: { maxSize: 0 },
		VoiceStateManager: { maxSize: 0 },
		GuildInviteManager: { maxSize: 0 }
	}),
	sweepers: {
		guildMembers: {
			interval: Time.Minute * 15,
			filter: () => member => !CACHED_ACTIVE_USER_IDS.has(member.user.id)
		},
		users: {
			interval: Time.Minute * 15,
			filter: () => user => !CACHED_ACTIVE_USER_IDS.has(user.id)
		}
	}
};
