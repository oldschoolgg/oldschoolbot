const { Command } = require('klasa');
const Crystalmethlabs = require('crystalmethlabs');
const osrs = new Crystalmethlabs('osrs');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 3,
			description: 'Shows the EHP stats of an account',
			usage: '[username:rsn]',
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	async run(msg, [username]) {
		const { err, stats } = await osrs.stats(username);
		if (err) return msg.send(err);

		for (const skill in stats) {
			if (stats[skill].rank !== undefined) stats[skill].rank = stats[skill].rank.toLocaleString();
		}

		const embed = new MessageEmbed()
			.setColor(3120895)
			.setFooter('CrystalMathLabs / EHP')
			.setDescription(username)
			.addField('Hours', parseInt(stats.ehp.hours).toFixed(2), true)
			.addField(`Rank`, stats.ehp.rank.toLocaleString(), true);

		return msg.send({ embed });
	}

};
