const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const OSJS = require('oldschooljs');

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
		const itemName = name.replace(/\W/g, '').toUpperCase()
		const item = items[itemName];
		const osjsItem = OSJS.Items.get(itemName);
		if (!item || osjsItem === undefined) return msg.send(`Couldn't find that item.`);

		const { overall, store, buy, sell, ID } = item;

		const embed = new MessageEmbed()
			.setTitle(item.name)
			.setColor(52224)
			.setThumbnail(
				`http://services.runescape.com/m=itemdb_oldschool/1521457324813_obj_big.gif?id=${ID}`
			)
			.addField('Overall Price', `${overall.toLocaleString()} gp`, true)
			.addField('Store Price', `${store.toLocaleString()} gp`, true)
			.addField('Buy Price', `${buy.toLocaleString()} gp`, true)
			.addField('Sell Price', `${sell.toLocaleString()} gp`, true)
			.addField('Low Alch', `${osjsItem.lowalch.toLocaleString()} gp`, true)
			.addField('High Alch', `${osjsItem.highalch.toLocaleString()} gp`, true)
			.setFooter('OSBuddy API');
		return msg.send({ embed });
	}
};
