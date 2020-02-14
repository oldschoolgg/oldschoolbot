import { KlasaClient, KlasaClientOptions } from 'klasa';

import emoji from '../data/skill-emoji';
import { token, twitchClientID, postgresConfig } from './private.js';
import permissionLevels from '../src/lib/config/permissionLevels';

const production = require('os').platform() === 'linux';

const clientProperties = {
	guildLogs: '346212633583681536',
	voteLogs: '469523207691436042',
	twitchClientID,
	emoji,
	timePeriods: {
		day: 86400,
		week: 604800,
		month: 2628000,
		year: 525667 * 60
	},
	notFound: `There was an error in fetching stats for that account. The account might not exist, or is banned.`,
	production
};

const clientOptions: KlasaClientOptions = {
	/* Discord.js Options */
	fetchAllMembers: false,
	messageCacheMaxSize: 200,
	messageCacheLifetime: 120,
	messageSweepInterval: 120,
	disabledEvents: [
		'TYPING_START',
		'CHANNEL_PINS_UPDATE',
		'PRESENCE_UPDATE',
		'VOICE_STATE_UPDATE',
		'VOICE_SERVER_UPDATE'
	],
	disableEveryone: true,
	shards: 'auto',
	ws: {
		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore
		guild_subscriptions: false
	},
	/* Klasa Options */
	createPiecesFolders: false,
	prefix: '+',
	providers: {
		default: 'postgres',
		postgres: postgresConfig
	},
	permissionLevels,
	pieceDefaults: { commands: { deletable: true } },
	readyMessage: (client: KlasaClient) =>
		`[Old School Bot] Ready to serve ${client.guilds.size} guilds and ${client.users.size} users`,
	schedule: {
		interval: 10000
	},
	noPrefixDM: true
};

export { token, clientOptions, clientProperties };
