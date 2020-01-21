import { KlasaClient, KlasaClientOptions } from 'klasa';

import emoji from './skill-emoji';
import streamers from '../data/osrs-streamers';
import { token, twitchClientID, twitterApp } from './private.js';
import permissionLevels from '../src/lib/config/permissionLevels';

const production = require('os').platform() === 'linux';

const clientProperties = {
	streamers,
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
	twitterApp,
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
		// eslint-disable-next-line camelcase
		// @ts-ignore
		guild_subscriptions: false
	},
	/* Klasa Options */
	createPiecesFolders: false,
	prefix: '+',
	providers: {
		default: production ? 'rethinkdb' : 'json'
	},
	permissionLevels,
	pieceDefaults: { commands: { deletable: true } },
	readyMessage: (client: KlasaClient) =>
		`[Old School Bot] Ready to serve ${client.guilds.size} guilds and ${client.users.size} users`,
	schedule: {
		interval: 10000
	}
};

export { token, clientOptions, clientProperties };
