import { ClientOptions, GatewayIntentBits, Partials } from 'discord.js';

import { customClientOptions, OWNER_IDS, production } from '../config';

export const clientOptions: ClientOptions = {
	owners: [...OWNER_IDS],
	shards: 'auto',
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.DirectMessageReactions,
		GatewayIntentBits.GuildWebhooks
	],
	partials: [Partials.User, Partials.Channel],
	production,
	...customClientOptions,
	allowedMentions: {
		parse: ['roles', 'users']
	}
};
