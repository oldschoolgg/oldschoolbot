import { MALEDICT_MORTIMER_ID } from '@/lib/bso/maledictMortimer.js';

import { EmbedBuilder } from '@oldschoolgg/discord';
import { shuffleArr } from '@oldschoolgg/rng';
import { sumArr, toTitleCase } from '@oldschoolgg/toolkit';
import { Bank, convertXPtoLVL, type ItemBank, type SkillsScore, toKMB } from 'oldschooljs';

import { ClueTiers } from '@/lib/clues/clueTiers.js';
import { getClueScoresFromOpenables } from '@/lib/clues/clueUtils.js';
import { badges, MAX_LEVEL } from '@/lib/constants.js';
import { calcCLDetails } from '@/lib/data/Collections.js';
import { skillEmoji } from '@/lib/data/emojis.js';
import { effectiveMonsters } from '@/lib/minions/data/killableMonsters/index.js';
import { courses } from '@/lib/skilling/skills/agility.js';
import Hunter from '@/lib/skilling/skills/hunter/hunter.js';
import type { Skills } from '@/lib/types/index.js';

export async function minionStatsEmbed(user: MUser): Promise<EmbedBuilder> {
	const { QP } = user;

	const xp = sumArr(Object.values(user.skillsAsXP) as number[]);
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
			MAX_LEVEL
		).toLocaleString()} (${toKMB(skillXP)})`;
	};

	const userStats = await user.fetchStats();

	const minigameScores = (await user.fetchMinigameScores())
		.filter(i => i.score > 0)
		.sort((a, b) => b.score - a.score);

	const rawBadges = user.user.badges;
	const badgesStr = rawBadges.map(num => badges[num]).join(' ');

	const embed = new EmbedBuilder().setTitle(`${badgesStr}${user.minionName}`.slice(0, 255)).addFields(
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
				'divination',
				'overall'
			]
				.map(skillCell)
				.join('\n'),
			inline: true
		}
	);

	if (user.isIronman) {
		embed.setColor([83, 83, 83]);
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

	const openableScores = getClueScoresFromOpenables(new Bank(userStats.openable_scores as ItemBank));
	const clueEntries = openableScores.items();
	if (clueEntries.length > 0) {
		embed.addFields({
			name: '<:Clue_scroll:365003979840552960> Clue Scores',
			value: clueEntries
				.map(([item, qty]) => {
					const clueTier = ClueTiers.find(t => t.id === item.id)!;
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
		['Fight Caves Attempts', userStats.fight_caves_attempts],
		['Fire Capes Sacrificed', userStats.firecapes_sacrificed],
		['Tithe Farm Score', userStats.tithe_farms_completed],
		['Dice Wins', userStats.dice_wins],
		['Dice Losses', userStats.dice_losses],
		['Duel Wins', userStats.duel_wins],
		['Duel Losses', userStats.duel_losses],
		['High Gambles', userStats.high_gambles],
		['Carpenter Points', user.user.carpenter_points],
		['Sacrificed', toKMB(Number(user.user.sacrificedValue))]
	];

	const lapCounts = Object.entries(userStats.laps_scores as ItemBank).sort((a, b) => a[1] - b[1]);
	if (lapCounts.length > 0) {
		const [id, score] = lapCounts[0];
		const res = courses.find(c => c.id === Number.parseInt(id))!;
		if (res) {
			otherStats.push([`${res.name} Laps`, score]);
		}
	}

	const monsterScores = Object.entries(userStats.monster_scores as ItemBank)
		.sort((a, b) => a[1] - b[1])
		.filter(i => ![MALEDICT_MORTIMER_ID].includes(Number(i[0])));
	if (monsterScores.length > 0) {
		const [id, score] = monsterScores[0];
		const res = effectiveMonsters.find(c => c.id === Number.parseInt(id, 10))!;
		if (!res) {
			Logging.logError(`No monster found with id ${id} for stats embed`);
		} else {
			otherStats.push([`${res.name} KC`, score]);
		}
	}

	const hunterScores = Object.entries(userStats.creature_scores as ItemBank).sort((a, b) => a[1] - b[1]);
	if (hunterScores.length > 0) {
		const [id, score] = hunterScores[0];
		const res = Hunter.Creatures.find(c => c.id === Number.parseInt(id, 10))!;
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
