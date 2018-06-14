const { Command } = require('klasa');
const snekfetch = require('snekfetch');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 2,
			description: 'Shows the followage of a given user from a given twitch channel.',
			usage: '<name:str> <channel:str>',
			usageDelim: ' '
		});
	}

	async run(msg, [twitchName, channelName]) {
		const [days, logo] = await snekfetch
			.get(`https://api.twitch.tv/kraken/users/${twitchName}/follows/channels/${channelName}`)
			.query('client_id', this.client.twitchClientID)
			.then(res => [this.differenceInDays(new Date(res.body.created_at), new Date()), res.body.channel.logo])
			.catch(() => { throw `${twitchName} isn't following ${channelName}, or it is banned, or doesn't exist at all.`; });

		const embed = new MessageEmbed()
			.setColor(6570406)
			.setAuthor(`${twitchName} has been following ${channelName} for ${days} days.`, logo);

		return msg.send({ embed });
	}

};
