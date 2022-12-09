import { EmbedBuilder } from 'discord.js';
import { shuffleArr } from 'e';
import { Bank } from 'oldschooljs';
import { SkillsScore } from 'oldschooljs/dist/meta/types';
import { convertXPtoLVL, toKMB } from 'oldschooljs/dist/util';

import { ClueTiers } from '../clues/clueTiers';
import { getClueScoresFromOpenables } from '../clues/clueUtils';
import { badges, skillEmoji } from '../constants';
import { calcCLDetails } from '../data/Collections';
import { effectiveMonsters } from '../minions/data/killableMonsters';
import { courses } from '../skilling/skills/agility';
import creatures from '../skilling/skills/hunter/creatures';
import { ItemBank, Skills } from '../types';
import { addArrayOfNumbers } from '../util';
import { logError } from './logError';
import { toTitleCase } from './toTitleCase';

export async function minionStatsEmbed(user: MUser): Promise<EmbedBuilder> {
	const { QP } = user;

	const xp = addArrayOfNumbers(Object.values(user.skillsAsXP) as number[]);
	const { totalLevel } = user;
	const skillCell = (skill: string) => {
		if (skill === 'overall') {
			return `${skillEmoji[skill as keyof typeof skillEmoji] as keyof SkillsScore} ${totalLevel}\n${
				skillEmoji.combat
			} ${user.combatLevel}`;
		}

		const skillXP = user.skillsAsXP[skill as keyof Skills] ?? 1;
		return `${skillEmoji[skill as keyof typeof skillEmoji] as keyof SkillsScore} ${convertXPtoLVL(
			skillXP,
			120
		).toLocaleString()} (${toKMB(skillXP)})`;
	};

	const openableScores = new Bank(user.user.openable_scores as ItemBank);
	getClueScoresFromOpenables(openableScores, true);

	const clueEntries = Object.entries(openableScores.bank);
	const minigameScores = (await user.fetchMinigameScores())
		.filter(i => i.score > 0)
		.sort((a, b) => b.score - a.score);

	const rawBadges = user.user.badges;
	const badgesStr = rawBadges.map(num => badges[num]).join(' ');

	const embed = new EmbedBuilder().setTitle(`${badgesStr}${user.minionName}`.slice(1, 255)).addFields(
		{
			name: '\u200b',
			value: [
				'attack',
				'strength',
				'defence',
				'ranged',
				'prayer',
				'magic',
				'runecraft',
				'construction',
				'invention'
			]
				.map(skillCell)
				.join('\n'),
			inline: true
		},
		{
			name: '\u200b',
			value: ['hitpoints', 'agility', 'herblore', 'thieving', 'crafting', 'fletching', 'slayer', 'hunter']
				.map(skillCell)
				.join('\n'),
			inline: true
		},
		{
			name: '\u200b',
			value: [
				'mining',
				'smithing',
				'fishing',
				'cooking',
				'firemaking',
				'woodcutting',
				'farming',
				'dungeoneering',
				'overall'
			]
				.map(skillCell)
				.join('\n'),
			inline: true
		}
	);

	if (user.isIronman) {
		embed.setColor(5_460_819);
	}

	const { percent } = calcCLDetails(user);
	embed.addFields({
		name: `${skillEmoji.total} Overall`,
		value: `**Level:** ${totalLevel}
**XP:** ${xp.toLocaleString()}
**QP** ${QP}
**CL Completion:** ${percent.toFixed(1)}%`,
		inline: true
	});

	if (clueEntries.length > 0) {
		embed.addFields({
			name: '<:Clue_scroll:365003979840552960> Clue Scores',
			value: clueEntries
				.map(([id, qty]) => {
					const clueTier = ClueTiers.find(t => t.id === parseInt(id));
					if (!clueTier) {
						logError(`No clueTier: ${id}`);
						return;
					}
					return `**${toTitleCase(clueTier.name)}:** ${qty.toLocaleString()}`;
				})
				.join('\n'),
			inline: true
		});
	}

	if (minigameScores.length > 0) {
		embed.addFields({
			name: '<:minigameIcon:630400565070921761> Minigames',
			value: minigameScores
				.slice(0, 4)
				.map(minigame => {
					return `**${toTitleCase(minigame.minigame.name)}:** ${minigame.score.toLocaleString()}`;
				})
				.join('\n'),
			inline: true
		});
	}

	const otherStats: [string, number | string][] = [
		['Fight Caves Attempts', user.user.stats_fightCavesAttempts],
		['Fire Capes Sacrificed', user.user.stats_fireCapesSacrificed],
		['Tithe Farm Score', user.user.stats_titheFarmsCompleted],
		['Dice Wins', user.user.stats_diceWins],
		['Dice Losses', user.user.stats_diceLosses],
		['Duel Wins', user.user.stats_duelWins],
		['Duel Losses', user.user.stats_duelLosses],
		['High Gambles', user.user.high_gambles],
		['Carpenter Points', user.user.carpenter_points],
		['Honour Level', user.user.honour_level],
		['Sacrificed', toKMB(Number(user.user.sacrificedValue))]
	];

	const lapCounts = Object.entries(user.user.lapsScores as ItemBank).sort((a, b) => a[1] - b[1]);
	if (lapCounts.length > 0) {
		const [id, score] = lapCounts[0];
		const res = courses.find(c => c.id === parseInt(id))!;
		if (res) {
			otherStats.push([`${res.name} Laps`, score]);
		}
	}

	const monsterScores = Object.entries(user.user.monsterScores as ItemBank).sort((a, b) => a[1] - b[1]);
	if (monsterScores.length > 0) {
		const [id, score] = monsterScores[0];
		const res = effectiveMonsters.find(c => c.id === parseInt(id))!;
		if (!res) {
			logError(`No monster found with id ${id} for stats embed`);
		} else {
			otherStats.push([`${res.name} KC`, score]);
		}
	}

	const hunterScores = Object.entries(user.user.creatureScores as ItemBank).sort((a, b) => a[1] - b[1]);
	if (hunterScores.length > 0) {
		const [id, score] = hunterScores[0];
		const res = creatures.find(c => c.id === parseInt(id))!;
		if (res) {
			otherStats.push([`${res.name}'s Caught`, score]);
		}
	}

	embed.addFields({
		name: 'Other',
		value: shuffleArr(otherStats)
			.slice(0, 4)
			.map(([name, text]) => {
				return `**${name}:** ${text}`;
			})
			.join('\n'),
		inline: true
	});

	return embed;
}
