const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const Parser = require('rss-parser');
const parser = new Parser();
module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 5,
			description: 'Shows the latest OSRS News Post.'
		});
	}

	async run(msg) {
		const feed = await parser.parseURL('http://services.runescape.com/m=news/latest_news.rss?oldschool=true');
		const news = feed.items[0];
		const embed = new MessageEmbed()
			.setTitle(news.title)
			.setDescription(news.contentSnippet)
			.setColor(52224)
			.setThumbnail(news.enclosure.url)
			.setURL(news.guid)
			.setFooter(news.categories[0], 'http://i.imgur.com/fVakfwp.png');
		return msg.send({ embed });
	}

};
