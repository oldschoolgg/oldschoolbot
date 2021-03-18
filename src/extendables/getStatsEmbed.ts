import { MessageEmbed } from 'discord.js';
import { Command, Extendable, ExtendableStore } from 'klasa';
import { Player } from 'oldschooljs';
import { CluesScore, SkillScore, SkillsScore } from 'oldschooljs/dist/meta/types';

import { skillEmoji } from '../lib/constants';
import { toTitleCase } from '../lib/util';

export default class GetStatsEmbed extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [Command], enabled: true });
	}

	getStatsEmbed(
		username: string,
		color: number,
		{ clues, minigames, skills, combatLevel }: Player,
		key: keyof SkillScore = 'level',
		showExtra = true
	) {
		const skillCell = (skill: string) =>
			`${skillEmoji[skill as keyof typeof skillEmoji] as keyof SkillsScore} ${skills[
				skill as keyof SkillsScore
			][key].toLocaleString()}`;

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
					`${skillEmoji.total} Overall`,
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
								`**${toTitleCase(tier)}:** ${clues[
									tier as keyof CluesScore
								].score.toLocaleString()}`
						),
					true
				);
		}
		return embed;
	}
}
