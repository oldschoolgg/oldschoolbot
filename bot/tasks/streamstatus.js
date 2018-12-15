const { Task } = require('klasa');
const snekfetch = require('snekfetch');
const moment = require('moment');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Task {

	async run() {
		snekfetch
			.get(`https://api.twitch.tv/kraken/streams?channel=${this.client.streamers.join(',')}`)
			.query('client_id', this.client.twitchClientID)
			.then(res => {
				const streams = JSON.parse(res.text);
				for (let i = 0; i < streams.streams.length; i++) {
					const liveTime = moment(streams.streams[i].created_at);
					if (moment().diff(liveTime, 'seconds') > 630) continue;
					const { channel, preview } = streams.streams[i];

					const embed = new MessageEmbed()
						.setColor(6570406)
						.setTitle(channel.status)
						.setURL(channel.url)
						.setThumbnail(channel.logo)
						.setAuthor(`${channel.display_name} is now Live on Twitch!`, null, channel.url)
						.setImage(`${preview.medium}?osrsbot=${Math.random() * 1000}`);

					this.client.guilds
						.filter(guild => guild.settings.get('twitchnotifs') && guild.settings.get('streamers').includes(channel.display_name.toLowerCase()))
						.forEach(guild => {
							const _channel = this.client.channels.get(guild.settings.get('twitchnotifs'));
							if (_channel) _channel.send({ embed });
						});
				}
				return this.client.user.setActivity(streams.streams[0].channel.display_name, { url: streams.streams[0].channel.url, type: 1 });
			});
	}

};
