const { Task } = require('klasa');
const fetch = require('node-fetch');
const moment = require('moment');
const { MessageEmbed } = require('discord.js');

const { twitchAPIRequestOptions, resolveTwitchUsersFromNames } = require('../../config/util');

module.exports = class extends Task {
	async init() {
		if (!this.client.twitchClientID) this.disable();
		await this.syncIDs();
	}

	async syncIDs() {
		this.idList = (await resolveTwitchUsersFromNames(this.client.streamers)).map(u => u._id);
	}

	async run() {
		if (!this.idList) await this.syncIDs();
		fetch(
			`https://api.twitch.tv/kraken/streams?channel=${this.idList.join(',')}&client_id=${
				this.client.twitchClientID
			}`,
			twitchAPIRequestOptions
		)
			.then(res => res.json())
			.then(res => {
				if (!res || !res.streams) return;
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
				this.client.user.setActivity('discord.gg/ob');
			})
			.catch(console.error);
	}
};
