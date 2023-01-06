import { Embed } from '@discordjs/builders';
import { Player } from 'oldschooljs';
import { CluesScore, SkillScore, SkillsScore } from 'oldschooljs/dist/meta/types';

import { skillEmoji } from '../data/emojis';
import { toTitleCase } from './toTitleCase';

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

	const embed = new Embed()
		.setColor(color)
		.setTitle(
			`${globalClient._badgeCache.get(username.toLowerCase()) || ''} ${toTitleCase(username)}${postfix ?? ''}`
		)
		.addField({
			name: '\u200b',
			value: ['attack', 'strength', 'defence', 'ranged', 'prayer', 'magic', 'runecraft', 'construction']
				.map(skillCell)
				.join('\n'),
			inline: true
		})
		.addField({
			name: '\u200b',
			value: ['hitpoints', 'agility', 'herblore', 'thieving', 'crafting', 'fletching', 'slayer', 'hunter']
				.map(skillCell)
				.join('\n'),
			inline: true
		})
		.addField({
			name: '\u200b',
			value: ['mining', 'smithing', 'fishing', 'cooking', 'firemaking', 'woodcutting', 'farming', 'overall']
				.map(skillCell)
				.join('\n'),
			inline: true
		});

	if (showExtra) {
		embed
			.addField({
				name: `${skillEmoji.total} Overall`,
				value: `**Rank:** ${player.skills.overall.rank.toLocaleString()}
**Level:** ${player.skills.overall.level}
**XP:** ${player.skills.overall.xp.toLocaleString()}
**Combat Level:** ${player.combatLevel}`,
				inline: true
			})
			.addField({
				name: '<:minigame_icon:630400565070921761> Minigame Scores',
				value: `**BH:** ${player.minigames.bountyHunter.score.toLocaleString()}
**BH-Rogue:** ${player.minigames.bountyHunterRogue.score.toLocaleString()}
**LMS:** ${player.minigames.LMS.score.toLocaleString()}
`,
				inline: true
			})
			.addField({
				name: '<:Clue_scroll:365003979840552960> Clue Scores',
				value: Object.keys(player.clues)
					.slice(1)
					.map(
						tier =>
							`**${toTitleCase(tier)}:** ${player.clues[tier as keyof CluesScore].score.toLocaleString()}`
					)
					.join('\n'),
				inline: true
			});
	}
	return embed;
}
