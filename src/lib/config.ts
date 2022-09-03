import { GatewayIntentBits, Partials } from 'discord.js';
import { KlasaClient, KlasaClientOptions } from 'klasa';

import { customClientOptions, OWNER_IDS, production } from '../config';

export const clientOptions: KlasaClientOptions = {
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
	/* Klasa Options */
	prefix: '+',
	readyMessage: (client: KlasaClient) => {
		return `[Old School Bot] Ready to serve ${client.guilds.cache.size} guilds.`;
	},
	partials: [Partials.User, Partials.Channel],
	production,
	...customClientOptions,
	allowedMentions: {
		parse: ['roles', 'users']
	}
};
