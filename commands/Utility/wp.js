const { Command } = require('klasa');
const snekfetch = require('snekfetch');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 3,
			description: 'Finds a Wikipedia Article by title.',
			usage: '<query:str>'
		});
	}

	async run(msg, [query]) {
		const article = await snekfetch
			.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${query}`)
			.then(res => res.body)
			.catch(() => {
				throw "I couldn't find a wikipedia article with that title!";
			});

		const embed = new MessageEmbed()
			.setColor(4886754)
			.setThumbnail((article.thumbnail && article.thumbnail.source) || 'https://i.imgur.com/fnhlGh5.png')
			.setURL(article.content_urls.desktop.page)
			.setTitle(article.title)
			.setDescription(article.extract);

		return msg.send({ embed });
	}

};
