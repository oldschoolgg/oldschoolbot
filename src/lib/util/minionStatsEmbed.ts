import { MessageEmbed } from 'discord.js';
import { KlasaUser } from 'klasa';
import { SkillsScore } from 'oldschooljs/dist/meta/types';
import { convertXPtoLVL, toKMB } from 'oldschooljs/dist/util';

import emoji from '../../lib/data/skill-emoji';
import ClueTiers from '../minions/data/clueTiers';
import { Minigames } from '../minions/data/minigames';
import { UserSettings } from '../settings/types/UserSettings';
import { Skills } from '../types';
import { addArrayOfNumbers, toTitleCase } from '../util';

export function minionStatsEmbed(user: KlasaUser) {
	const { rawSkills } = user;
	const QP = user.settings.get(UserSettings.QP);

	const xp = addArrayOfNumbers(Object.values(rawSkills) as number[]);
	const totalLevel = user.totalLevel();
	const skillCell = (skill: string) => {
		if (skill === 'overall') {
			return `${emoji[skill as keyof typeof emoji] as keyof SkillsScore} ${totalLevel}`;
		}

		const skillXP = rawSkills[skill as keyof Skills] ?? 1;
		return `${emoji[skill as keyof typeof emoji] as keyof SkillsScore} ${convertXPtoLVL(
			skillXP
		).toLocaleString()} (${toKMB(skillXP)})`;
	};

	const clueEntries = Object.entries(user.settings.get(UserSettings.ClueScores));
	const minigameEntries = Object.entries(user.settings.get(UserSettings.MinigameScores)).sort(
		(a, b) => b[1] - a[1]
	);

	const embed = new MessageEmbed()
		.setTitle(`${user.settings.get(UserSettings.Badges).join('')}${user.minionName}`)
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

	if (user.isIronman) {
		embed.setColor(5460819);
	}

	embed.addField(
		`${emoji.total} Overall`,
		`**Level:** ${totalLevel}
**XP:** ${xp.toLocaleString()}
**QP** ${QP}`,
		true
	);
	// 		.addField(
	// 			`<:minigame_icon:630400565070921761> Minigame Scores`,
	// 			`**BH:** ${minigames.bountyHunter.score.toLocaleString()}
	// **BH-Rogue:** ${minigames.bountyHunterRogue.score.toLocaleString()}
	// **LMS:** ${minigames.LMS.score.toLocaleString()}
	// `,
	// 			true
	// 		)

	if (clueEntries.length > 0) {
		embed.addField(
			'<:Clue_scroll:365003979840552960> Clue Scores',
			clueEntries.map(([id, qty]) => {
				const clueTier = ClueTiers.find(t => t.id === parseInt(id))!;
				return `**${toTitleCase(clueTier.name)}:** ${qty.toLocaleString()}`;
			}),
			true
		);
	}

	if (minigameEntries.length > 0) {
		embed.addField(
			'<:minigameIcon:630400565070921761> Minigames',
			minigameEntries.slice(0, 4).map(([id, qty]) => {
				const minigame = Minigames.find(t => t.id === parseInt(id))!;
				return `**${toTitleCase(minigame.name)}:** ${qty.toLocaleString()}`;
			}),
			true
		);
	}

	return embed;
}
