const { Command, Timestamp } = require('klasa');
const snekfetch = require('snekfetch');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Returns information on a Twitch.tv Account',
			usage: '<name:str>'
		});
		this.timestamp = new Timestamp('DD-MM-YYYY');
	}

	async run(msg, [twitchName]) {
		const body = await snekfetch.get(`https://api.twitch.tv/kraken/channels/${twitchName}`)
			.query('client_id', this.client.twitchClientID)
			.then(res => res.body)
			.catch(() => { throw 'Unable to find account. Did you spell it correctly?'; });

		const creationDate = this.timestamp.display(body.created_at);

		const embed = new MessageEmbed()
			.setColor(6570406)
			.setThumbnail(body.logo)
			.setAuthor(body.display_name, 'https://i.imgur.com/OQwQ8z0.jpg', body.url)
			.addField('Account ID', body._id, true)
			.addField('Followers', body.followers, true)
			.addField('Created On', creationDate, true)
			.addField('Channel Views', body.views, true);

		return msg.send({ embed });
	}

};
