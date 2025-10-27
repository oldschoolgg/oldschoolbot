import { calcWhatPercent, objectEntries, stringMatches, toTitleCase } from '@oldschoolgg/toolkit';
import { strikethrough } from 'discord.js';
import { Bank, Items, Monsters } from 'oldschooljs';

import type { Minigame } from '@/prisma/main.js';
import { diaries, userhasDiaryTierSync } from '@/lib/diaries.js';
import type { DiaryTier } from '@/lib/minions/types.js';
import { Minigames } from '@/lib/settings/minigames.js';
import type { MUserStats } from '@/lib/structures/MUserStats.js';
import { formatSkillRequirements } from '@/lib/util/smallUtils.js';

const lampRewards = {
	Easy: 'Antique lamp 1',
	Medium: 'Antique lamp 2',
	Hard: 'Antique lamp 3',
	Elite: 'Antique lamp 4'
} as const;

function howManyOfTierCompleted({
	stats,
	tiers,
	user,
	minigameScores
}: {
	stats: MUserStats;
	minigameScores: Minigame;
	user: MUser;
	tiers: DiaryTier[];
}) {
	let completed = 0;
	for (const tier of tiers) {
		const has = userhasDiaryTierSync(user, tier, { stats, minigameScores }).hasDiary;
		if (has) completed++;
	}
	return completed;
}

export async function achievementDiaryCommand(user: MUser, diaryName: string) {
	const diary = diaries.find(
		d => stringMatches(d.name, diaryName) || d.alias?.some(a => stringMatches(a, diaryName))
	);
	const [stats, minigameScores] = await Promise.all([user.fetchMStats(), user.fetchMinigames()]);
	await user.syncCompletedAchievementDiaries({ stats, minigameScores });
	if (!diary) {
		let str = 'Your Achievement Diaries\n\n';
		for (const dir of diaries) {
			const res = [dir.easy, dir.medium, dir.hard, dir.elite].map(tier => {
				return {
					name: tier.name,
					has: userhasDiaryTierSync(user, tier, { stats, minigameScores }).hasDiary
				};
			});
			str += `**${dir.name}:** ${res.map(t => (t.has ? strikethrough(t.name) : t.name)).join(' - ')}\n`;
		}
		return str;
	}

	let str = `**Requirements for ${diary.name} Diary**\n`;

	for (const tier of [diary.easy, diary.medium, diary.hard, diary.elite]) {
		let thisStr = `**${tier.name}**\n`;
		thisStr += `- Skill Reqs: ${formatSkillRequirements(tier.skillReqs, false)}\n`;

		if (tier.ownedItems) {
			thisStr += `- Must Own: ${tier.ownedItems.map(i => Items.itemNameFromId(i)).join(', ')}\n`;
		}

		if (tier.collectionLogReqs) {
			thisStr += `- Must Have in CL: ${tier.collectionLogReqs.map(i => Items.itemNameFromId(i)).join(', ')}\n`;
		}

		if (tier.qp) {
			thisStr += `- **${tier.qp}** QP\n`;
		}

		if (tier.minigameReqs) {
			const entries = Object.entries(tier.minigameReqs);
			for (const [key, neededScore] of entries) {
				const minigame = Minigames.find(m => m.column === key)!;
				thisStr += `- Must Have **${neededScore}** KC in ${minigame.name}\n`;
			}
		}

		if (tier.lapsReqs) {
			const entries = Object.entries(tier.lapsReqs);
			for (const [name, score] of entries) {
				thisStr += `- Must Have **${score}** Laps of ${name}\n`;
			}
		}

		if (tier.monsterScores) {
			for (const [id, score] of objectEntries(tier.monsterScores)) {
				const mon = Monsters.get(Number(id))!;
				thisStr += `- Must Have **${score}** KC of ${mon.name}\n`;
			}
		}

		if (tier.customReq) {
			const [hasCustomReq, reason] = tier.customReq(user, true, stats);
			if (!hasCustomReq) {
				thisStr += `- Extra Requirements: ${reason}\n`;
			}
		}

		str += `${thisStr}\n`;
	}
	return str;
}

export async function claimAchievementDiaryCommand(user: MUser, diaryName: string) {
	const diary = diaries.find(
		d => stringMatches(d.name, diaryName) || d.alias?.some(a => stringMatches(a, diaryName))
	);

	if (!diary) {
		return `These are the achievement diaries you can claim: ${diaries.map(d => d.name).join(', ')}.`;
	}

	const allItems = user.allItemsOwned;
	const { cl } = user;
	const [stats, minigameScores] = await Promise.all([user.fetchMStats(), user.fetchMinigames()]);

	for (const tier of ['easy', 'medium', 'hard', 'elite'] as const) {
		const diaryTier = diary[tier];
		const { hasDiary, reasons } = userhasDiaryTierSync(user, diaryTier, { stats, minigameScores });
		const name = `${toTitleCase(diaryTier.name)} ${diary.name} Diary`;
		let hasItems = true;
		const loot = new Bank();

		if (hasDiary) {
			for (const item of diaryTier.items) {
				if (!allItems.has(item.id)) {
					hasItems = false;
					loot.add(item.id);
				}
			}

			if (hasItems) continue;

			const hasCompleted = howManyOfTierCompleted({
				user,
				minigameScores,
				stats,
				tiers: diaries.map(d => d[tier])
			});

			if (cl.amount(lampRewards[diaryTier.name]) < hasCompleted) {
				loot.add(lampRewards[diaryTier.name]);
			}

			await user.addItemsToBank({
				items: loot,
				collectionLog: true
			});

			return `You successfully completed the ${name} and received ${loot}.`;
		}

		return `You can't claim the ${name} because: \n- ${reasons}.`;
	}

	return `You have already completed the entire ${diary.name} diary!`;
}

export function calculateAchievementDiaryProgress(user: MUser, stats: MUserStats, minigameScores: Minigame) {
	let totalDiaries = 0;
	let totalCompleted = 0;

	for (const diaryLocation of diaries) {
		for (const diaryTier of [diaryLocation.easy, diaryLocation.medium, diaryLocation.hard, diaryLocation.elite]) {
			const { hasDiary } = userhasDiaryTierSync(user, diaryTier, { stats, minigameScores });
			totalDiaries++;
			if (hasDiary) {
				totalCompleted++;
			}
		}
	}

	return {
		totalDiaries,
		totalCompleted,
		percentComplete: calcWhatPercent(totalCompleted, totalDiaries)
	};
}
