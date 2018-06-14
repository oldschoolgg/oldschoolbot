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
					if (moment().diff(liveTime, 'seconds') <= 630) {
						const streamer = streams.streams[i];
						const embed = new MessageEmbed()
							.setColor(6570406)
							.setTitle(streamer.channel.status)
							.setURL(streamer.channel.url)
							.setThumbnail(streamer.channel.logo)
							.setAuthor(`${streamer.channel.display_name} is now Live on Twitch!`, null, streamer.channel.url)
							.setImage(`${streamer.preview.medium}?osrsbot=${Math.random() * 1000}`);

						this.client.guilds.filter(guild => guild.configs.twitchnotifs).forEach(guild => {
							// if (!this.client.channels.get(guild.configs.twitchnotifs)) return guild.configs.reset('twitchnotifs');
							if (!guild.configs.streamers.includes(streamer.channel.display_name.toLowerCase())) return null;

							this.client.channels
								.get(guild.configs.twitchnotifs)
								.send({ embed });

							return null;
						});
					}
				}
				return this.client.user.setActivity('+github');
				// return this.client.user.setActivity(streams.streams[0].channel.display_name, { url: streams.streams[0].channel.url, type: 1 });
			});
	}

};
