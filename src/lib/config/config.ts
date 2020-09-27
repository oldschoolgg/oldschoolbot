import { KlasaClient, KlasaClientOptions } from 'klasa';

import { customClientOptions, production, providerConfig, twitchClientID } from '../../config';
import { Intents } from './Intents';
import permissionLevels from './permissionLevels';

const clientProperties = {
	twitchClientID,
	production
};

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
		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
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
	noPrefixDM: true,
	partials: ['USER'],
	...customClientOptions
};

export { clientOptions, clientProperties };
