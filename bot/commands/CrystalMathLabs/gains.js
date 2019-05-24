const { Command } = require('klasa');
const Crystalmethlabs = require('crystalmethlabs');
const osrs = new Crystalmethlabs('osrs');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 2,
			description: 'Shows the ranks of an account',
			usage: '<ehp|ranks|xp|levels> <day|week|month|year> [username:...rsn]',
			usageDelim: ' ',
			requiredPermissions: ['EMBED_LINKS']
		});
		this.types = {
			ehp: 'ehpGained',
			ranks: 'ranksGained',
			xp: 'xpGained',
			levels: 'levelsGained'
		};
	}

	async run(msg, [type, timePeriod, username]) {
		const { emoji } = this.client;
		const apiType = this.types[type];

		const { err, stats } = await osrs.track(username, this.client.timePeriods[timePeriod]);
		if (err) return msg.send(err.length > 1 ? err : 'An unexpected error occured, please try again.');

		if (apiType === 'xpGained') {
			for (const skill in stats) {
				if (stats[skill].xpGained !== undefined) {
					stats[skill].xpGained = stats[skill].xpGained.toLocaleString();
				}
			}
		}

		const embed = new MessageEmbed()
			.setColor(3120895)
			.setFooter(`CrystalMathLabs / ${type} / ${timePeriod}`, 'https://i.imgur.com/k12Kmhg.png')
			.setDescription(username)
			.addField(
				'\u200b',
				`
${emoji.attack} ${stats.attack[apiType]}
${emoji.strength} ${stats.strength[apiType]}
${emoji.defence} ${stats.defence[apiType]}
${emoji.ranged} ${stats.ranged[apiType]}
${emoji.prayer} ${stats.prayer[apiType]}
${emoji.magic} ${stats.magic[apiType]}
${emoji.runecraft} ${stats.runecrafting[apiType]}
${emoji.construction} ${stats.construction[apiType]}`,
				true
			)
			.addField(
				'\u200b',
				`
${emoji.hitpoints} ${stats.hitpoints[apiType]}
${emoji.agility} ${stats.agility[apiType]}
${emoji.herblore} ${stats.herblore[apiType]}
${emoji.thieving} ${stats.thieving[apiType]}
${emoji.crafting} ${stats.crafting[apiType]}
${emoji.fletching} ${stats.fletching[apiType]}
${emoji.slayer} ${stats.slayer[apiType]}
${emoji.hunter} ${stats.hunter[apiType]}`,
				true
			)
			.addField(
				'\u200b',
				`
${emoji.mining} ${stats.mining[apiType]}
${emoji.smithing} ${stats.smithing[apiType]}
${emoji.fishing} ${stats.fishing[apiType]}
${emoji.cooking} ${stats.cooking[apiType]}
${emoji.firemaking} ${stats.firemaking[apiType]}
${emoji.woodcutting} ${stats.woodcutting[apiType]}
${emoji.farming} ${stats.farming[apiType]}
${emoji.total} ${stats.overall[apiType]}`,
				true
			)
			.addField(`${emoji.total} Overall`, type, true);

		return msg.send({ embed });
	}

	convertXPtoLVL(xp, cap) {
		if (cap === undefined) cap = 99;
		let points = 0;
		for (let lvl = 1; lvl <= cap; lvl++) {
			points += Math.floor((lvl + 300) * Math.pow(2, lvl / 7));
			if (Math.floor(points / 4) >= xp + 1) return lvl;
		}
		return cap;
	}

};
