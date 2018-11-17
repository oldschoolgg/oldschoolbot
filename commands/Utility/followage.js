const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 2,
			description: 'Shows the followage of a given user from a given twitch channel.',
			usage: '<user:str> <channel:str>',
			usageDelim: ' ',
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	async run(msg, [user, channel]) {
		const [days, logo] = await fetch(this.url(user, channel))
			.then(({ body }) => [this.differenceInDays(new Date(body.created_at), new Date()), body.channel.logo])
			.catch(() => {
				throw `${user} isn't following ${channel}, or it is banned, or doesn't exist at all.`;
			});

		const embed = new MessageEmbed()
			.setColor(6570406)
			.setAuthor(`${user} has been following ${channel} for ${days} days.`, logo);

		return msg.send({ embed });
	}

	url(user, channel) {
		return `https://api.twitch.tv/kraken/users/${user}/follows/channels/${channel}` +
		`?client_id=${this.client.twitchClientID}`;
	}

};
