const emoji = require('./skill-emoji');
const streamers = require('../data/osrs-streamers');
const { token, twitchClientID, twitterApp } = require('./private.js');

const production = require('os').platform() === 'linux';

module.exports = {
	token,
	clientProperties: {
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
	},
	clientOptions: {
		/* Discord.js Options */
		fetchAllMembers: false,
		messageCacheMaxSize: 200,
		messageCacheLifetime: 120,
		messageSweepInterval: 120,
		disabledEvents: [
			'RELATIONSHIP_REMOVE',
			'RELATIONSHIP_ADD',
			'TYPING_START',
			'USER_NOTE_UPDATE',
			'CHANNEL_PINS_UPDATE',
			'PRESENCE_UPDATE',
			'USER_SETTINGS_UPDATE',
			'VOICE_STATE_UPDATE',
			'VOICE_SERVER_UPDATE'
		],
		disableEveryone: true,
		shards: 'auto',
		ws: {
			// eslint-disable-next-line camelcase
			guild_subscriptions: false
		},
		/* Klasa Options */
		createPiecesFolders: false,
		prefix: '+',
		providers: { default: production ? 'rethinkdb' : 'json' },
		permissionLevels: require('./PermissionLevels'),
		pieceDefaults: { commands: { deletable: true } },
		readyMessage: client =>
			`[Old School Bot] Ready to serve ${client.guilds.size} guilds and ${client.users.size} users`,
		schedule: {
			interval: 10000
		}
	}
};
