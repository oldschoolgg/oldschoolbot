const { Command } = require('klasa');
const Crystalmethlabs = require('crystalmethlabs');
const osrs = new Crystalmethlabs('osrs');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 3,
			description: 'Shows the ranks of an account',
			usage: '[user:user|username:str]'
		});
	}

	async run(msg, [username]) {
		username = this.getUsername(username, msg);

		const { emoji } = this.client;

		const { err, stats } = await osrs.stats(username);
		if (err) return msg.send(err);

		for (const skill in stats) {
			if (stats[skill].rank !== undefined) stats[skill].rank = stats[skill].rank.toLocaleString();
		}

		const embed = new MessageEmbed()
			.setColor(3120895)
			.setFooter('CrystalMathLabs / Ranks', 'https://i.imgur.com/k12Kmhg.png')
			.setDescription(username)
			.addField(
				'\u200b',
				`
${emoji.attack} ${stats.attack.rank}
${emoji.strength} ${stats.strength.rank}
${emoji.defence} ${stats.defence.rank}
${emoji.ranged} ${stats.ranged.rank}
${emoji.prayer} ${stats.prayer.rank}
${emoji.magic} ${stats.magic.rank}
${emoji.runecraft} ${stats.runecrafting.rank}
${emoji.construction} ${stats.construction.rank}`,
				true
			)
			.addField(
				'\u200b',
				`
${emoji.hitpoints} ${stats.hitpoints.rank}
${emoji.agility} ${stats.agility.rank}
${emoji.herblore} ${stats.herblore.rank}
${emoji.thieving} ${stats.thieving.rank}
${emoji.crafting} ${stats.crafting.rank}
${emoji.fletching} ${stats.fletching.rank}
${emoji.slayer} ${stats.slayer.rank}
${emoji.hunter} ${stats.hunter.rank}`,
				true
			)
			.addField(
				'\u200b',
				`
${emoji.mining} ${stats.mining.rank}
${emoji.smithing} ${stats.smithing.rank}
${emoji.fishing} ${stats.fishing.rank}
${emoji.cooking} ${stats.cooking.rank}
${emoji.firemaking} ${stats.firemaking.rank}
${emoji.woodcutting} ${stats.woodcutting.rank}
${emoji.farming} ${stats.farming.rank}
${emoji.total} ${stats.overall.rank}`,
				true
			)
			.addField(
				`${emoji.total} Overall`,
				`**Rank:** ${stats.overall.rank}\n**Level:** ${stats.overall.level}\n**XP:** ${stats.overall.xp.toLocaleString()}`,
				true
			)
			.addField(`${emoji.clock} EHP`, `**Hours:** ${parseInt(stats.ehp.hours).toFixed(2)}\n**Rank:** ${stats.ehp.rank.toLocaleString()}`, true)
			.addField('\u200b', '\u200b', true);
		return msg.send({ embed });
	}

};
