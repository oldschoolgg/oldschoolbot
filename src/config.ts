import { KlasaClient, KlasaClientOptions } from 'klasa';
import * as fs from 'fs';

import emoji from '../data/skill-emoji';
import permissionLevels from './lib/config/permissionLevels';
import { PrivateConfig } from './lib/types';

let privateConfig: PrivateConfig | undefined;
if (!fs.existsSync('./private.json')) {
	fs.writeFileSync('./private.json', JSON.stringify({ token: 'PUT_TOKEN_HERE' }, null, 4));
	console.error(`Please fill in the bots token in the private.json file.`);
	process.exit();
} else {
	privateConfig = JSON.parse(fs.readFileSync('./private.json').toString());
}

const production = require('os').platform() === 'linux';

const clientProperties = {
	twitchClientID: privateConfig?.twitchClientID,
	emoji,
	timePeriods: {
		day: 86400,
		week: 604800,
		month: 2628000,
		year: 525667 * 60
	},
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
	permissionLevels,
	pieceDefaults: { commands: { deletable: true } },
	readyMessage: (client: KlasaClient) =>
		`[Old School Bot] Ready to serve ${client.guilds.size} guilds and ${client.users.size} users`,
	schedule: {
		interval: 10000
	},
	noPrefixDM: true
};

export { privateConfig, clientOptions, clientProperties };
