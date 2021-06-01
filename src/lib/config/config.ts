import { Intents } from 'discord.js';
import { KlasaClient, KlasaClientOptions } from 'klasa';

import { customClientOptions, production, providerConfig } from '../../config';
import permissionLevels from './permissionLevels';

export const clientOptions: KlasaClientOptions = {
	/* Discord.js Options */
	fetchAllMembers: false,
	messageCacheMaxSize: 200,
	messageCacheLifetime: 120,
	messageSweepInterval: 120,
	// disableEveryone: true,
	shards: 'auto',
	ws: {
		intents: new Intents([
			'GUILDS',
			'GUILD_MESSAGES',
			'GUILD_MESSAGE_REACTIONS',
			'DIRECT_MESSAGES',
			'DIRECT_MESSAGE_REACTIONS'
		]).bitfield
	},
	http: {
		api: 'https://discord.com/api'
	},
	/* Klasa Options */
	createPiecesFolders: false,
	prefix: '=',
	providers: providerConfig ?? undefined,
	permissionLevels,
	pieceDefaults: { commands: { deletable: true } },
	readyMessage: (client: KlasaClient) =>
		`[Old School Bot] Ready to serve ${client.guilds.cache.size} guilds.`,
	partials: ['USER'],
	production,
	...customClientOptions
};
