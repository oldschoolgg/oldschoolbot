import { MessageEmbed } from 'discord.js';
import { KlasaUser } from 'klasa';
import { SkillsScore } from 'oldschooljs/dist/meta/types';
import { convertXPtoLVL, toKMB } from 'oldschooljs/dist/util';

import emoji from '../../lib/data/skill-emoji';
import ClueTiers from '../minions/data/clueTiers';
import { UserSettings } from '../settings/types/UserSettings';
import { Skills } from '../types';
import { addArrayOfNumbers, toTitleCase } from '../util';

export async function minionStatsEmbed(user: KlasaUser) {
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
	const minigameScores = (await user.getAllMinigameScores())
		.filter(i => i.score > 0)
		.sort((a, b) => b.score - a.score);

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

	if (minigameScores.length > 0) {
		embed.addField(
			'<:minigameIcon:630400565070921761> Minigames',
			minigameScores.slice(0, 4).map(minigame => {
				return `**${toTitleCase(minigame.minigame.name)}:** ${minigame.score}`;
			}),
			true
		);
	}

	return embed;
}
