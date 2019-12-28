const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const { Items } = require('oldschooljs');

const { cleanString } = require('../../../config/util');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			cooldown: 2,
			description: 'Looks up the price of an item using the OSBuddy API.',
			usage: '<name:str>'
		});
	}

	async run(msg, [name]) {
		const items = this.client.settings.get('prices');
		const itemName = cleanString(name);
		const item = items[itemName];
		const osjsItem = Items.get(itemName);
		if (!item || osjsItem === undefined) return msg.send(`Couldn't find that item.`);

		const { overall, store, buy, sell, ID } = item;

		const embed = new MessageEmbed()
			.setTitle(item.name)
			.setColor(52224)
			.setThumbnail(
				`https://raw.githubusercontent.com/runelite/static.runelite.net/gh-pages/cache/item/icon/${ID}.png`
			)
			.addField('Overall Price', `${overall.toLocaleString()} gp`, true)
			.addField('Store Price', `${store.toLocaleString()} gp`, true)
			.addField('Buy Price', `${buy.toLocaleString()} gp`, true)
			.addField('Sell Price', `${sell.toLocaleString()} gp`, true)
			.addField('Low Alch', `${osjsItem.lowalch.toLocaleString()} gp`, true)
			.addField('High Alch', `${osjsItem.highalch.toLocaleString()} gp`, true);

		return msg.send({ embed });
	}
};
