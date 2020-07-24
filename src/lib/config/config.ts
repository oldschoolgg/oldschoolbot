import { KlasaClient, KlasaClientOptions } from 'klasa';

import permissionLevels from './permissionLevels';
import { Intents } from './Intents';
import { customClientOptions, production, providerConfig, twitchClientID } from '../../config';

const clientProperties = {
	twitchClientID,
	production,
	timePeriods: {
		day: 86400,
		week: 604800,
		month: 2628000,
		year: 525667 * 60
	}
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
	prefix: '+',
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
