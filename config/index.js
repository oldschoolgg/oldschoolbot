const emoji = require('./skill-emoji');
const streamers = require('../data/osrs-streamers');
const { token, twitchClientID, twitterApp, dbl } = require('./private.js');

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
		dbl,
		twitterApp,
		cmlDown: `The CrystalMathLabs API is currently disabled. Please try again in 5 minutes.`,
		notFound: `There was an error in fetching stats for that account. The account might not exist, or is banned.`,
		production
	},
	clientOptions: {
		/* Discord.js Options */
		fetchAllMembers: false,
		messageCacheMaxSize: 5,
		messageCacheLifetime: 60,
		messageSweepInterval: 60,
		disabledEvents: [
			'RELATIONSHIP_REMOVE',
			'RELATIONSHIP_ADD',
			'TYPING_START',
			'USER_NOTE_UPDATE',
			'CHANNEL_PINS_UPDATE',
			'GUILD_MEMBERS_CHUNK',
			'PRESENCE_UPDATE',
			'USER_SETTINGS_UPDATE',
			'MESSAGE_REACTION_REMOVE_ALL',
			'MESSAGE_REACTION_REMOVE',
			'MESSAGE_REACTION_ADD'
		],
		disableEveryone: true,
		shardCount: 'auto',
		/* Klasa Options */
		createPiecesFolders: false,
		prefix: '+',
		providers: { default: production ? 'rethinkdb' : 'json' },
		permissionLevels: require('./PermissionLevels'),
		pieceDefaults: { commands: { deletable: true } },
		readyMessage: client => `[Old School Bot] Ready to serve ${client.guilds.size} guilds and ${client.users.size} users`
	}
};
