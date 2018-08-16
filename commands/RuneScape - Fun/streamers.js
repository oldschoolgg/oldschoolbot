const { Command } = require('klasa');
const snekfetch = require('snekfetch');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 2,
			aliases: ['streams'],
			description: 'Shows the current top 4 RuneScape streamers on Twitch.'
		});
	}

	async run(msg) {
		const { stringList, streams } = await snekfetch
			.get(`https://api.twitch.tv/helix/streams?game_id=459931&&type=live&first=4`, { headers: { 'Client-ID': this.client.twitchClientID } })
			.then(res => {
				const { data } = JSON.parse(res.text);
				return {
					stringList: data.map(stream => stream.user_id).join('&id='),
					streams: data
				};
			});

		const streamers = await snekfetch
			.get(`https://api.twitch.tv/helix/users?id=${stringList}`, { headers: { 'Client-ID': this.client.twitchClientID } })
			.then(res => {
				const { data } = JSON.parse(res.text);
				const usernames = data.map(user => user.display_name);
				for (let i = 0; i < streams.length; i++) {
					streams[i].username = usernames[i];
				}
				return streams;
			});

		const embed = new MessageEmbed()
			.setColor(8311585)
			.setFooter('RuneScape Streamers', 'https://i.imgur.com/OQwQ8z0.jpg');

		streamers.map(strm => embed.addField(
			`${strm.username} [${strm.viewer_count} Viewers]`,
			`${strm.title} \nhttps://www.twitch.tv/${strm.username.toLowerCase()}`
		));

		return msg.send({ embed });
	}

};
