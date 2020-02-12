const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

const items = require('../../../data/buyLimits.json');
const { cleanString } = require('../../util');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			cooldown: 3,
			aliases: ['limit'],
			description: 'Check the buy limit of an item.',
			usage: '<query:str{3,35}>',
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	async run(msg, [query]) {
		const res = items
			.filter(i => cleanString(i.name).includes(cleanString(query)))
			.slice(0, 10);

		if (res.length === 0) throw "Couldn't find any items!";

		const names = res
			.map(
				i => `[${i.name}](https://oldschool.runescape.wiki/w/${encodeURIComponent(i.name)})`
			)
			.join('\n');
		const limits = res.map(i => `${i.limit}`).join('\n');

		const embed = new MessageEmbed()
			.setColor(11132490)
			.setThumbnail('https://i.imgur.com/8DJaki0.png')
			.setTitle('Buy Limits')
			.addField('Item', names, true)
			.addField('Limit', limits, true);

		return msg.send({ embed });
	}
};
