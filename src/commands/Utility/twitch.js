const { Command, Timestamp } = require('klasa');
const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');

const { twitchClientID } = require('../../../private.json');

const { resolveTwitchUsersFromNames, twitchAPIRequestOptions } = require('../../util');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			description: 'Returns information on a Twitch.tv Account',
			usage: '<name:str>',
			requiredPermissions: ['EMBED_LINKS']
		});
		this.timestamp = new Timestamp('DD-MM-YYYY');
		this.error = 'Unable to find account. Did you spell it correctly?';
	}

	async init() {
		if (!twitchClientID) this.disable();
	}

	async run(msg, [twitchName]) {
		const [user] = await resolveTwitchUsersFromNames([twitchName]).catch(() => {
			throw this.error;
		});

		if (!user) {
			throw this.error;
		}

		const channel = await fetch(
			`https://api.twitch.tv/kraken/channels/${user._id}`,
			twitchAPIRequestOptions
		)
			.then(res => res.json())
			.catch(() => {
				throw this.error;
			});

		const creationDate = this.timestamp.display(channel.created_at);

		const embed = new MessageEmbed()
			.setColor(6570406)
			.setThumbnail(channel.logo)
			.setAuthor(channel.display_name, 'https://i.imgur.com/OQwQ8z0.jpg', channel.url)
			.addField('Account ID', channel._id, true)
			.addField('Followers', channel.followers, true)
			.addField('Created On', creationDate, true)
			.addField('Channel Views', channel.views, true);

		return msg.send({ embed });
	}
};
