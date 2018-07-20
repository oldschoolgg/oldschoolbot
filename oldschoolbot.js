const { Client } = require('klasa');
const Discord = require('discord.js');
const { token, emoji, streamers, guildLogs, voteLogs, twitchClientID, twitterApp, dblToken, dblAuth } = require('./config');

class OldSchoolBot extends Client {

	constructor(options) {
		super(options);
		this.emoji = emoji;
		this.streamers = streamers;
		this.guildLogs = new Discord.WebhookClient(guildLogs.id, guildLogs.token);
		this.voteLogs = new Discord.WebhookClient(voteLogs.id, voteLogs.token);
		this.twitchClientID = twitchClientID;
		this.dblToken = dblToken;
		this.dblAuth = dblAuth;
		this.timePeriods = {
			day: 86400,
			week: 604800,
			month: 2628000,
			year: 525667 * 60
		};
		this.notFound = `There was an error in fetching stats for that account. The account might not exist, or is banned.`;
		this.cmlDown = `The CrystalMathLabs API is currently disabled. Please try again in 5 minutes.`;
		this.twitterApp = twitterApp;
	}

	roll(max) {
		return Math.floor((Math.random() * max) + 1) === 1;
	}

}

new OldSchoolBot({
	fetchAllMembers: false,
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
	messageCacheMaxSize: 5,
	messageCacheLifetime: 60,
	messageSweepInterval: 60,
	prefix: '+',
	shardCount: 'auto',
	providers: { default: 'rethinkdb' },
	pieceDefaults: { commands: { deletable: true } },
	readyMessage: client => `[Old School Bot] Ready to serve ${client.guilds.size} guilds and ${client.users.size} users`
}).login(token);
