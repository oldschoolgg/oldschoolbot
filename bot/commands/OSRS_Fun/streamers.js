const { Command } = require('klasa');
const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 2,
			aliases: ['streams'],
			description: 'Shows the current top 5 RuneScape streamers on Twitch.'
		});
	}

	async run(msg) {
		const [stringList, streams] = await fetch(`https://api.twitch.tv/helix/streams?game_id=459931&&type=live&first=12`, {
			headers: { 'Client-ID': this.client.twitchClientID }
		})
			.then(res => res.json())
			.then(res => {
				console.log(res);
				return [
					res.data.map(stream => stream.user_id).join('&id='),
					res.data
				];
			}
			);

		const streamers = await fetch(`https://api.twitch.tv/helix/users?id=${stringList}`, {
			headers: {
				'Client-ID': this.client.twitchClientID
			}
		})
			.then(res => res.json())
			.then(res => {
				const usernames = res.data.map(user => user.display_name);
				for (let i = 0; i < streams.length; i++) {
					streams[i].username = usernames[i];
				}
				return streams;
			});

		const embed = new MessageEmbed()
			.setColor(8311585);

		streamers
			.filter(str => str.username && this.client.streamers.includes(str.username.toLowerCase()))
			.slice(0, 5)
			.map(strm => embed.addField(
				`${strm.username} - ${strm.viewer_count} Viewers`,
				`${strm.title} \nhttps://www.twitch.tv/${strm.username.toLowerCase()}`
			));

		return msg.send({ embed });
	}

};
