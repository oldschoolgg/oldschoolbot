const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

const getURL = (query) => `https://oldschool.runescape.wiki/api.php?action=query&format=json&prop=extracts%7Cpageimages%7Cinfo&iwurl=1&generator=search&formatversion=2&exsentences=5&exintro=1&explaintext=1&piprop=original&inprop=url&gsrsearch=${query}&gsrlimit=1`;

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 3,
			aliases: ['w'],
			description: 'Search the OSRS Wikipedia for an article.',
			usage: '[query:str]',
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	async run(msg, [query]) {
		if (!query) {
			return msg.send('https://oldschool.runescape.wiki');
		}

		const { title, extract, original, fullurl } = await fetch(getURL(query))
			.then(res => res.json())
			.then(res => res.query.pages[0])
			.catch(() => {
				throw "I couldn't find anything with that query!";
			});

		const embed = new MessageEmbed()
			.setColor(52224)
			.setThumbnail(original && original.source)
			.setURL(fullurl)
			.setTitle(title)
			.setDescription(extract)
			.setFooter('Old School RuneScape Wiki', 'https://i.imgur.com/GMs5my3.png');
		return msg.send({ embed });
	}

};
