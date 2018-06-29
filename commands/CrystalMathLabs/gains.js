const { Command } = require('klasa');
const Crystalmethlabs = require('crystalmethlabs');
const osrs = new Crystalmethlabs('osrs');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 2,
			description: 'Shows the ranks of an account',
			usage: '<ehp|ranks|xp|levels> <day|week|month|year> <username:str> [...]',
			usageDelim: ' '
		});
		this.types = {
			ehp: 'ehpGained',
			ranks: 'ranksGained',
			xp: 'xpGained',
			levels: 'levelsGained'
		};
	}

	async run(msg, [type, timePeriod, ...username]) {
		const { emoji } = this.client;
		type = this.types[type];
		username = username.join(' ');

		const { err, stats } = await osrs.track(username, this.client.timePeriods[timePeriod]);
		if (err) return msg.send(err);

		if (type === 'xpGained') {
			for (const skill in stats) {
				if (stats[skill].xpGained !== undefined) stats[skill].xpGained = stats[skill].xpGained.toLocaleString();
			}
		}

		const embed = new MessageEmbed()
			.setColor(3120895)
			.setFooter(`CrystalMathLabs / ${type} / ${timePeriod}`, 'https://i.imgur.com/k12Kmhg.png')
			.setDescription(username)
			.addField(
				'\u200b',
				`
${emoji.attack} ${stats.attack[type]}
${emoji.strength} ${stats.strength[type]}
${emoji.defence} ${stats.defence[type]}
${emoji.ranged} ${stats.ranged[type]}
${emoji.prayer} ${stats.prayer[type]}
${emoji.magic} ${stats.magic[type]}
${emoji.runecraft} ${stats.runecrafting[type]}
${emoji.construction} ${stats.construction[type]}`,
				true
			)
			.addField(
				'\u200b',
				`
${emoji.hitpoints} ${stats.hitpoints[type]}
${emoji.agility} ${stats.agility[type]}
${emoji.herblore} ${stats.herblore[type]}
${emoji.thieving} ${stats.thieving[type]}
${emoji.crafting} ${stats.crafting[type]}
${emoji.fletching} ${stats.fletching[type]}
${emoji.slayer} ${stats.slayer[type]}
${emoji.hunter} ${stats.hunter[type]}`,
				true
			)
			.addField(
				'\u200b',
				`
${emoji.mining} ${stats.mining[type]}
${emoji.smithing} ${stats.smithing[type]}
${emoji.fishing} ${stats.fishing[type]}
${emoji.cooking} ${stats.cooking[type]}
${emoji.firemaking} ${stats.firemaking[type]}
${emoji.woodcutting} ${stats.woodcutting[type]}
${emoji.farming} ${stats.farming[type]}
${emoji.total} ${stats.overall[type]}`,
				true
			)
			.addField(`${emoji.total} Overall`, stats.overall[type], true);
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
