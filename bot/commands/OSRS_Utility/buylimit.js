const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

const items = require('../../../data/buyLimits.json');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 3,
			aliases: ['limit'],
			description: 'Check the buy limit of an item.',
			usage: '<query:str{3,15}>',
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	async run(msg, [query]) {
		const res = items.filter(i => this.cleanString(i.name).includes(this.cleanString(query)))
			.map(i => `${i.name} has a limit of ${i.limit}`)
			.slice(0, 10);


		if (res.length === 0) throw "Couldn't find any items!";

		const embed = new MessageEmbed()
			.setColor(11132490)
			.setThumbnail('https://i.imgur.com/8DJaki0.png')
			.setTitle('Buy Limits')
			.addField('Item', res.map(i => `[${i.name}](https://oldschool.runescape.wiki/w/${i.name})\n`), true)
			.addField('Limit', res.map(i => `${i.limit}\n`), true);

		return msg.send({ embed });
	}

};
