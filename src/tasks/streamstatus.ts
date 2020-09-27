import { MessageEmbed, TextChannel } from 'discord.js';
import { Task } from 'klasa';
import moment from 'moment';
import fetch from 'node-fetch';

import OSRSStreamers from '../../data/osrs_streamers';
import { GuildSettings } from '../lib/settings/types/GuildSettings';
import { resolveTwitchUsersFromNames, twitchAPIRequestOptions } from '../util';

export default class extends Task {
	public idList: number[] = [];

	async init() {
		if (!this.client.twitchClientID) this.disable();
		await this.syncIDs();
	}

	async syncIDs() {
		this.idList = (await resolveTwitchUsersFromNames(OSRSStreamers)).map((u: any) => u._id);
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
							undefined,
							channel.url
						)
						.setImage(`${preview.medium}?osrsbot=${Math.random() * 1000}`);

					this.client.guilds
						.filter(
							guild =>
								Boolean(
									guild.settings.get(GuildSettings.TwitchNotifications.Channel)
								) &&
								guild.settings
									.get(GuildSettings.TwitchNotifications.Streamers)
									.includes(channel.display_name.toLowerCase())
						)
						.forEach(guild => {
							const _channel = this.client.channels.get(
								guild.settings.get(GuildSettings.TwitchNotifications.Channel)
							);

							if (_channel && _channel instanceof TextChannel && _channel.postable) {
								_channel.send({ embed });
							}
						});
				}
			})
			.catch(console.error);

		this.client.user?.setActivity('discord.gg/ob');
	}
}
