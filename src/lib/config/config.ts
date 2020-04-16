import { KlasaClient, KlasaClientOptions } from 'klasa';

import permissionLevels from './permissionLevels';
import { providerConfig, twitchClientID, customClientOptions, KDHPort } from '../../config';
import ApiResponse from '../api/structures/ApiResponse';
import ApiRequest from '../api/structures/ApiRequest';

const clientProperties = {
	twitchClientID,
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
	providers: providerConfig,
	permissionLevels,
	pieceDefaults: { commands: { deletable: true } },
	readyMessage: (client: KlasaClient) =>
		`[Old School Bot] Ready to serve ${client.guilds.size} guilds.`,
	schedule: {
		interval: 10000
	},
	noPrefixDM: true,
	dashboardHooks: {
		port: KDHPort,
		apiPrefix: '',
		serverOptions: {
			IncomingMessage: ApiRequest,
			ServerResponse: ApiResponse
		}
	},
	...customClientOptions
};

export { clientOptions, clientProperties };
