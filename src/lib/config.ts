import { Intents } from 'discord.js';
import { KlasaClient, KlasaClientOptions } from 'klasa';

import { OWNER_IDS, production, providerConfig } from '../config';

export const clientOptions: KlasaClientOptions = {
	/* Discord.js Options */
	messageCacheMaxSize: 200,
	messageCacheLifetime: 120,
	messageSweepInterval: 5000,
	owners: [...OWNER_IDS],
	shards: 'auto',
	http: {
		api: 'https://discord.com/api'
	},
	intents: new Intents([
		'GUILDS',
		'GUILD_MESSAGES',
		'GUILD_MESSAGE_REACTIONS',
		'DIRECT_MESSAGES',
		'DIRECT_MESSAGE_REACTIONS',
		'GUILD_WEBHOOKS'
	]),
	/* Klasa Options */
	prefix: '=',
	providers: providerConfig ?? undefined,
	readyMessage: (client: KlasaClient) => {
		return `[Bot School School] Ready to serve ${client.guilds.cache.size} guilds.`;
	},
	partials: ['USER', 'CHANNEL'],
	production,
	allowedMentions: {
		parse: ['roles', 'users']
	}
};
