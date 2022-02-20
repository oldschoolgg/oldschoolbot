import { MessageEmbed } from 'discord.js';
import { Player } from 'oldschooljs';
import { CluesScore, SkillScore, SkillsScore } from 'oldschooljs/dist/meta/types';

import { client } from '../..';
import { skillEmoji } from '../constants';
import { toTitleCase } from '../util';

export function statsEmbed({
	username,
	color,
	player,
	key = 'level',
	showExtra = true,
	postfix
}: {
	username: string;
	color: number;
	player: Player;
	key?: keyof SkillScore;
	showExtra?: boolean;
	postfix?: string;
}) {
	const skillCell = (skill: string) =>
		`${skillEmoji[skill as keyof typeof skillEmoji] as keyof SkillsScore} ${player.skills[
			skill as keyof SkillsScore
		][key].toLocaleString()}`;

	const embed = new MessageEmbed()
		.setColor(color)
		.setTitle(`${client._badgeCache.get(username.toLowerCase()) || ''} ${toTitleCase(username)}${postfix ?? ''}`)
		.addField(
			'\u200b',
			['attack', 'strength', 'defence', 'ranged', 'prayer', 'magic', 'runecraft', 'construction']
				.map(skillCell)
				.join('\n'),
			true
		)
		.addField(
			'\u200b',
			['hitpoints', 'agility', 'herblore', 'thieving', 'crafting', 'fletching', 'slayer', 'hunter']
				.map(skillCell)
				.join('\n'),
			true
		)
		.addField(
			'\u200b',
			['mining', 'smithing', 'fishing', 'cooking', 'firemaking', 'woodcutting', 'farming', 'overall']
				.map(skillCell)
				.join('\n'),
			true
		);

	if (showExtra) {
		embed
			.addField(
				`${skillEmoji.total} Overall`,
				`**Rank:** ${player.skills.overall.rank.toLocaleString()}
**Level:** ${player.skills.overall.level}
**XP:** ${player.skills.overall.xp.toLocaleString()}
**Combat Level:** ${player.combatLevel}`,
				true
			)
			.addField(
				'<:minigame_icon:630400565070921761> Minigame Scores',
				`**BH:** ${player.minigames.bountyHunter.score.toLocaleString()}
**BH-Rogue:** ${player.minigames.bountyHunterRogue.score.toLocaleString()}
**LMS:** ${player.minigames.LMS.score.toLocaleString()}
`,
				true
			)
			.addField(
				'<:Clue_scroll:365003979840552960> Clue Scores',
				Object.keys(player.clues)
					.slice(1)
					.map(
						tier =>
							`**${toTitleCase(tier)}:** ${player.clues[tier as keyof CluesScore].score.toLocaleString()}`
					)
					.join('\n'),
				true
			);
	}
	return embed;
}
