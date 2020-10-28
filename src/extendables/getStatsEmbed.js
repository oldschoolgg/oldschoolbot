const { Extendable, Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

const { toTitleCase } = require('../lib/util');

const { default: emoji } = require('../../data/skill-emoji');

class getStatsEmbed extends Extendable {
	constructor(...args) {
		super(...args, {
			appliesTo: [Command],
			enabled: true,
			klasa: true
		});
	}

	getStatsEmbed(
		username,
		color,
		{ clues, minigames, skills, combatLevel },
		key = 'level',
		showExtra = true
	) {
		const skillCell = skill => `${emoji[skill]} ${skills[skill][key].toLocaleString()}`;

		const embed = new MessageEmbed()
			.setColor(color)
			.setTitle(
				`${this.client._badgeCache.get(username.toLowerCase()) || ''} ${toTitleCase(
					username
				)}`
			)
			.addField(
				'\u200b',
				[
					'attack',
					'strength',
					'defence',
					'ranged',
					'prayer',
					'magic',
					'runecraft',
					'construction'
				].map(skillCell),
				true
			)
			.addField(
				'\u200b',
				[
					'hitpoints',
					'agility',
					'herblore',
					'thieving',
					'crafting',
					'fletching',
					'slayer',
					'hunter'
				].map(skillCell),
				true
			)
			.addField(
				'\u200b',
				[
					'mining',
					'smithing',
					'fishing',
					'cooking',
					'firemaking',
					'woodcutting',
					'farming',
					'overall'
				].map(skillCell),
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
						.map(
							tier =>
								`**${toTitleCase(tier)}:** ${clues[tier].score.toLocaleString()}`
						),
					true
				);
		}
		return embed;
	}
}

module.exports = getStatsEmbed;
