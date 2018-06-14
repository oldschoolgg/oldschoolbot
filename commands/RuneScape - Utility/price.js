const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 2,
			description: 'Looks up the price of an item using the OSBuddy API.',
			usage: '<name:str>'
		});
	}

	async run(msg, [name]) {
		const item = this.client.configs.prices[name.replace(/\W/g, '').toUpperCase()];
		if (!item) return msg.send(`Couldn't find that item.`);

		const embed = new MessageEmbed()
			.setTitle(item.name)
			.setColor(52224)
			.setThumbnail(`http://services.runescape.com/m=itemdb_oldschool/1521457324813_obj_big.gif?id=${item.ID}`)
			.addField('Overall Price', `${item.overall.toLocaleString()} gp`, true)
			.addField('Store Price', `${item.store.toLocaleString()} gp`, true)
			.addField('Buy Price', `${item.buy.toLocaleString()} gp`, true)
			.addField('Sell Price', `${item.sell.toLocaleString()} gp`, true)
			.setFooter('OSBuddy API');
		return msg.send({ embed });
	}

};
