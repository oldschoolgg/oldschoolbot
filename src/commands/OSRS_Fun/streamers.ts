import { MessageEmbed } from 'discord.js';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import fetch from 'node-fetch';

import OSRSStreamers from '../../../data/osrs_streamers';

export default class extends Command {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 2,
			aliases: ['streams'],
			enabled: false
		});
	}

	async init() {
		if (!this.client.twitchClientID) this.disable();
	}

	async run(msg: KlasaMessage) {
		const [stringList, streams] = await fetch(
			`https://api.twitch.tv/helix/streams?game_id=459931&&type=live&first=12`,
			{
				headers: { 'Client-ID': this.client.twitchClientID as string }
			}
		)
			.then(res => res.json())
			.then(res => [res.data.map((stream: any) => stream.user_id).join('&id='), res.data]);

		const streamers = await fetch(`https://api.twitch.tv/helix/users?id=${stringList}`, {
			headers: {
				'Client-ID': this.client.twitchClientID as string
			}
		})
			.then(res => res.json())
			.then(res => {
				const usernames = res.data.map((user: any) => user.display_name);
				for (let i = 0; i < streams.length; i++) {
					streams[i].username = usernames[i];
				}
				return streams;
			});

		const embed = new MessageEmbed().setColor(8311585);

		streamers
			.filter(
				(str: any) => str.username && OSRSStreamers.includes(str.username.toLowerCase())
			)
			.slice(0, 5)
			.map((strm: any) =>
				embed.addField(
					`${strm.username} - ${strm.viewer_count} Viewers`,
					`https://www.twitch.tv/${strm.username.toLowerCase()}`
				)
			);

		return msg.send({ embed });
	}
}
