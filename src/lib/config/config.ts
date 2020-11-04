import { KlasaClient, KlasaClientOptions } from 'klasa';

import { customClientOptions, production, providerConfig } from '../../config';
import { Intents } from './Intents';
import permissionLevels from './permissionLevels';

const clientOptions: KlasaClientOptions = {
	/* Discord.js Options */
	fetchAllMembers: false,
	messageCacheMaxSize: 200,
	messageCacheLifetime: 120,
	messageSweepInterval: 120,
	disabledEvents: ['CHANNEL_PINS_UPDATE'],
	disableEveryone: true,
	shards: 'auto',
	ws: {
		// @ts-ignore
		intents: new Intents([
			'GUILDS',
			'GUILD_MEMBERS',
			'GUILD_MESSAGES',
			'GUILD_MESSAGE_REACTIONS',
			'DIRECT_MESSAGES',
			'DIRECT_MESSAGE_REACTIONS'
		]).bitfield
	},
	/* Klasa Options */
	createPiecesFolders: false,
	prefix: '=',
	providers: providerConfig ?? undefined,
	permissionLevels,
	pieceDefaults: { commands: { deletable: true } },
	readyMessage: (client: KlasaClient) =>
		`[Old School Bot] Ready to serve ${client.guilds.size} guilds.`,
	schedule: {
		interval: 10000
	},
	partials: ['USER'],
	production,
	...customClientOptions
};

export { clientOptions };
