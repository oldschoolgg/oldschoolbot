const { Command, RichDisplay } = require('klasa');
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
		const [message, feed] = await Promise.all([
			msg.send('Loading...'),
			parser.parseURL('http://services.runescape.com/m=news/latest_news.rss?oldschool=true')
		]);
		const display = new RichDisplay();
		display.setFooterPrefix(`Page `);

		for (const item of feed.items) {
			display.addPage(new MessageEmbed()
				.setTitle(item.title)
				.setDescription(item.contentSnippet)
				.setColor(52224)
				.setThumbnail(item.enclosure.url)
				.setURL(item.guid));
		}


		return display.run(message, { jump: false, stop: false });
	}

};
