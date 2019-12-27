const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

const { twitchClientID } = require('../../../config/private');

const { resolveTwitchUsersFromNames, twitchAPIRequestOptions } = require('../../../config/util');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			description: 'Shows the followage of a given user from a given twitch channel.',
			usage: '<user:str{1,20}> <channel:str{1,20}>',
			usageDelim: ' '
		});
		this.error = "That user isn't following that channel, or it is banned/doesn't exist.";
	}

	async init() {
		if (!twitchClientID) this.disable();
	}

	async run(msg, [userName, channelName]) {
		const [user, channel] = await resolveTwitchUsersFromNames([userName, channelName]).catch(
			() => msg.send(this.error)
		);

		if (!user || !channel) return msg.send("Either the user or channel doesn't exist.");

		const body = await fetch(
			`https://api.twitch.tv/kraken/users/${user._id}/follows/channels/${channel._id}`,
			twitchAPIRequestOptions
		)
			.then(response => response.json())
			.catch(() => msg.send(this.error));

		const days = this.differenceDays(new Date(body.created_at), new Date());

		if (!body.channel) throw this.error;

		const embed = new MessageEmbed()
			.setColor(6570406)
			.setAuthor(
				`${user.display_name} has been following ${channel.display_name} for ${days} days.`,
				body.channel.logo
			);

		return msg.send(embed);
	}

	differenceDays(first, second) {
		return Math.floor((second - first) / (1000 * 60 * 60 * 24));
	}
};
