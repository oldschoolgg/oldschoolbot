const { Extendable } = require('klasa');
const { MessageEmbed } = require('discord.js');

class getStatsEmbed extends Extendable {

	constructor(...args) {
		super(...args, {
			appliesTo: ['Command'],
			enabled: true,
			klasa: true
		});
	}

	async extend(username, color, { Skills }, key = 'level') {
		const { emoji } = this.client;
		const embed = new MessageEmbed()
			.setColor(color)
			.setAuthor(username)
			.addField(
				'\u200b',
				`
${emoji.attack} ${Skills.Attack[key]}
${emoji.strength} ${Skills.Strength[key]}
${emoji.defence} ${Skills.Defence[key]}
${emoji.ranged} ${Skills.Ranged[key]}
${emoji.prayer} ${Skills.Prayer[key]}
${emoji.magic} ${Skills.Magic[key]}
${emoji.runecraft} ${Skills.Runecrafting[key]}
${emoji.construction} ${Skills.Construction[key]}`,
				true
			)
			.addField(
				'\u200b',
				`
${emoji.hitpoints} ${Skills.Hitpoints[key]}
${emoji.agility} ${Skills.Agility[key]}
${emoji.herblore} ${Skills.Herblore[key]}
${emoji.thieving} ${Skills.Thieving[key]}
${emoji.crafting} ${Skills.Crafting[key]}
${emoji.fletching} ${Skills.Fletching[key]}
${emoji.slayer} ${Skills.Slayer[key]}
${emoji.hunter} ${Skills.Hunter[key]}`,
				true
			)
			.addField(
				'\u200b',
				`
${emoji.mining} ${Skills.Mining[key]}
${emoji.smithing} ${Skills.Smithing[key]}
${emoji.fishing} ${Skills.Fishing[key]}
${emoji.cooking} ${Skills.Cooking[key]}
${emoji.firemaking} ${Skills.Firemaking[key]}
${emoji.woodcutting} ${Skills.Woodcutting[key]}
${emoji.farming} ${Skills.Farming[key]}
${emoji.total} ${Skills.Overall[key]}`,
				true
			)
			.addField(
				`${emoji.total} Overall`,
				`**Rank:** ${Skills.Overall.rank.toLocaleString()}\n**Level:** ${Skills.Overall.level}\n**XP:** ${Skills.Overall.xp.toLocaleString()}`,
				true
			)
			.addField(`Other`, `**Combat Level:** ${await this.combatLevel(Skills)}`, true)
			.addField('\u200b', '\u200b', true);
		return embed;
	}

}

module.exports = getStatsEmbed;
