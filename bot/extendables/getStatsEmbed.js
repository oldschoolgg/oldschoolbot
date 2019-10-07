const { Extendable, Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

const { toTitleCase } = require('../../config/util');

class getStatsEmbed extends Extendable {
	constructor(...args) {
		super(...args, {
			appliesTo: [Command],
			enabled: true,
			klasa: true
		});
	}

	async getStatsEmbed(
		username,
		color,
		{ clues, minigames, skills, combatLevel },
		key = 'level',
		showExtra = true
	) {
		const { emoji } = this.client;
		const embed = new MessageEmbed()
			.setColor(color)
			.setTitle(
				`${this.client._badgeCache.get(username.toLowerCase()) || ''} ${toTitleCase(
					username
				)}`
			)
			.addField(
				'\u200b',
				`
${emoji.attack} ${skills.attack[key].toLocaleString()}
${emoji.strength} ${skills.strength[key].toLocaleString()}
${emoji.defence} ${skills.defence[key].toLocaleString()}
${emoji.ranged} ${skills.ranged[key].toLocaleString()}
${emoji.prayer} ${skills.prayer[key].toLocaleString()}
${emoji.magic} ${skills.magic[key].toLocaleString()}
${emoji.runecraft} ${skills.runecrafting[key].toLocaleString()}
${emoji.construction} ${skills.construction[key].toLocaleString()}`,
				true
			)
			.addField(
				'\u200b',
				`
${emoji.hitpoints} ${skills.hitpoints[key].toLocaleString()}
${emoji.agility} ${skills.agility[key].toLocaleString()}
${emoji.herblore} ${skills.herblore[key].toLocaleString()}
${emoji.thieving} ${skills.thieving[key].toLocaleString()}
${emoji.crafting} ${skills.crafting[key].toLocaleString()}
${emoji.fletching} ${skills.fletching[key].toLocaleString()}
${emoji.slayer} ${skills.slayer[key].toLocaleString()}
${emoji.hunter} ${skills.hunter[key].toLocaleString()}`,
				true
			)
			.addField(
				'\u200b',
				`
${emoji.mining} ${skills.mining[key].toLocaleString()}
${emoji.smithing} ${skills.smithing[key].toLocaleString()}
${emoji.fishing} ${skills.fishing[key].toLocaleString()}
${emoji.cooking} ${skills.cooking[key].toLocaleString()}
${emoji.firemaking} ${skills.firemaking[key].toLocaleString()}
${emoji.woodcutting} ${skills.woodcutting[key].toLocaleString()}
${emoji.farming} ${skills.farming[key].toLocaleString()}
${emoji.total} ${skills.overall[key].toLocaleString()}`,
				true
			);

		if (showExtra) {
			embed
				.addField(
					`${emoji.total} Overall`,
					`**Rank:** ${skills.overall.rank.toLocaleString()}
**Level:** ${skills.overall.level}
**XP:** ${skills.overall.xp.toLocaleString()}
**Combat Level:** ${combatLevel}`,
					true
				)
				.addField(
					`<:minigame_icon:630400565070921761> Minigame Scores`,
					`**BH:** ${minigames.bountyHunter.score.toLocaleString()}
**BH-Rogue:** ${minigames.bountyHunterRogue.score.toLocaleString()}
**LMS:** ${minigames.LMS.score.toLocaleString()}
`,
					true
				)
				.addField(
					'<:Clue_scroll:365003979840552960> Clue Scores',
					Object.keys(clues)
						.slice(1)
						.map(tier => `**${tier}:** ${clues[tier].score.toLocaleString()}`),
					true
				);
		}
		return embed;
	}
}

module.exports = getStatsEmbed;
