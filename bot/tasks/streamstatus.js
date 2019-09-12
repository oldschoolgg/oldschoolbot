const { Task } = require('klasa');
const fetch = require('node-fetch');
const moment = require('moment');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Task {
	async init() {
		if (!this.client.twitchClientID) this.disable();
	}

	async run() {
		fetch(
			`https://api.twitch.tv/kraken/streams?channel=${this.client.streamers.join(
				','
			)}&client_id=${this.client.twitchClientID}`
		)
			.then(res => res.json())
			.then(res => {
				for (let i = 0; i < res.streams.length; i++) {
					const liveTime = moment(res.streams[i].created_at);
					if (moment().diff(liveTime, 'seconds') > 630) continue;
					const { channel, preview } = res.streams[i];

					const embed = new MessageEmbed()
						.setColor(6570406)
						.setTitle(channel.status)
						.setURL(channel.url)
						.setThumbnail(channel.logo)
						.setAuthor(
							`${channel.display_name} is now Live on Twitch!`,
							null,
							channel.url
						)
						.setImage(`${preview.medium}?osrsbot=${Math.random() * 1000}`);

					this.client.guilds
						.filter(
							guild =>
								guild.settings.get('twitchnotifs') &&
								guild.settings
									.get('streamers')
									.includes(channel.display_name.toLowerCase())
						)
						.forEach(guild => {
							const _channel = this.client.channels.get(
								guild.settings.get('twitchnotifs')
							);
							if (_channel) _channel.send({ embed });
						});
				}
				return this.client.user.setActivity(res.streams[0].channel.display_name, {
					url: res.streams[0].channel.url,
					type: 1
				});
			})
			.catch(console.error);
	}
};
