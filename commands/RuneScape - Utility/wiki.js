const { Command } = require('klasa');
const snekfetch = require('snekfetch');
const base = 'http://oldschoolrunescape.wikia.com';
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 3,
			aliases: ['w'],
			description: 'Search the OSRS Wikipedia for an article.',
			usage: '<query:str>'
		});
	}

	async run(msg, [query]) {
		const { id } = await snekfetch
			.get(`${base}/api/v1/Search/List?query=${query}`)
			.then(res => res.body.items[0])
			.catch(() => {
				throw "I couldn't find anything with that query!";
			});

		const item = await snekfetch
			.get(`${base}/api/v1/Articles/Details?ids=${id}&abstract=250`)
			.then(res => res.body.items[id])
			.catch(() => {
				throw "I couldn't find anything with that query!";
			});

		const embed = new MessageEmbed()
			.setColor(52224)
			.setThumbnail(item.thumbnail)
			.setURL(base + item.url)
			.setTitle(item.title)
			.setDescription(item.abstract)
			.setFooter('Old School RuneScape Wiki', 'https://i.imgur.com/GMs5my3.png');
		return msg.send({ embed });
	}

};
