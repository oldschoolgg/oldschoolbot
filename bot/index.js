const { Client } = require('klasa');
const { WebhookClient } = require('discord.js');
const {
	token,
	clientOptions,
	clientProperties
} = require('../config');

require('../config/Schemas');

class OldSchoolBot extends Client {

	constructor(options) {
		super(options);
		for (const prop in clientProperties) {
			this[prop] = clientProperties[prop];
		}
	 	// this.emoji = emoji;
		// this.streamers = streamers;
		// this.guildLogs = new WebhookClient(guildLogs.id, guildLogs.token);
		// this.voteLogs = new WebhookClient(voteLogs.id, voteLogs.token);
		// this.twitchClientID = twitchClientID;
		// this.dblToken = dbl.token;
		// this.dblAuth = dbl.auth;
		// this.jmodRedditAccounts = jmodRedditAccounts;
		// this.timePeriods = {
		//	day: 86400,
		//	week: 604800,
		//	month: 2628000,
		//	year: 525667 * 60
		// };
		// this.cmlDown = `The CrystalMathLabs API is currently disabled. Please try again in 5 minutes.`;
		// this.twitterApp = twitterApp;
	}

	roll(max) {
		return Math.floor((Math.random() * max) + 1) === 1;
	}

}

new OldSchoolBot(clientOptions).login(token);
