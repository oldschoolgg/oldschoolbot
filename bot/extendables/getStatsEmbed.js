const { Extendable, Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

const { toTitleCase, cbLevelFromPlayer } = require('../../config/util');

class getStatsEmbed extends Extendable {
	constructor(...args) {
		super(...args, {
			appliesTo: [Command],
			enabled: true,
			klasa: true
		});
	}

	async getStatsEmbed(username, color, { Skills, Minigames }, key = 'level', showExtra = true) {
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
			);

		if (showExtra) {
			const clues = {
				Beginner: Minigames.Clue_Scrolls_Beginner,
				Easy: Minigames.Clue_Scrolls_Easy,
				Medium: Minigames.Clue_Scrolls_Medium,
				Hard: Minigames.Clue_Scrolls_Hard,
				Elite: Minigames.Clue_Scrolls_Elite,
				Master: Minigames.Clue_Scrolls_Master
			};

			embed
				.addField(
					`${emoji.total} Overall`,
					`**Rank:** ${Skills.Overall.rank.toLocaleString()}
**Level:** ${Skills.Overall.level}
**XP:** ${Skills.Overall.xp.toLocaleString()}
**Combat Level:** ${cbLevelFromPlayer(Skills)}`,
					true
				)
				.addField(
					`<:minigame_icon:630400565070921761> Minigame Scores`,
					`**BH:** ${Minigames.Bounty_Hunter.score}
**BH-Rogue:** ${Minigames.Bounty_Hunter_Rogues.score}
**LMS:** ${Minigames.LMS.score}
`,
					true
				)
				.addField(
					'<:Clue_scroll:365003979840552960> Clue Scores',
					Object.keys(clues).map(tier => `**${tier}:** ${clues[tier].score}`),
					true
				);
		}
		return embed;
	}
}

module.exports = getStatsEmbed;
