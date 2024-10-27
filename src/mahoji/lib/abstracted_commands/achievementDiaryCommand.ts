import { toTitleCase } from '@oldschoolgg/toolkit/util';
import { strikethrough } from 'discord.js';
import { calcWhatPercent } from 'e';
import { Bank, Monsters } from 'oldschooljs';

import type { Minigame } from '@prisma/client';
import { diaries, userhasDiaryTier, userhasDiaryTierSync } from '../../../lib/diaries';
import type { DiaryTier } from '../../../lib/minions/types';
import { Minigames } from '../../../lib/settings/minigames';
import { MUserStats } from '../../../lib/structures/MUserStats';
import { formatSkillRequirements, itemNameFromID, stringMatches } from '../../../lib/util';

const lampRewards = {
	Easy: 'Antique lamp 1',
	Medium: 'Antique lamp 2',
	Hard: 'Antique lamp 3',
	Elite: 'Antique lamp 4'
} as const;

async function howManyOfTierCompleted(user: MUser, tiers: DiaryTier[]) {
	let completed = 0;
	for (const tier of tiers) {
		const [has] = await userhasDiaryTier(user, tier);
		if (has) completed++;
	}
	return completed;
}

export async function achievementDiaryCommand(user: MUser, diaryName: string) {
	const diary = diaries.find(
		d => stringMatches(d.name, diaryName) || d.alias?.some(a => stringMatches(a, diaryName))
	);
	const stats = await MUserStats.fromID(user.id);

	if (!diary) {
		let str = 'Your Achievement Diaries\n\n';
		for (const dir of diaries) {
			const res = await Promise.all(
				[dir.easy, dir.medium, dir.hard, dir.elite].map(async tier => {
					return {
						name: tier.name,
						has: (await userhasDiaryTier(user, tier))[0]
					};
				})
			);
			str += `**${dir.name}:** ${res.map(t => (t.has ? strikethrough(t.name) : t.name)).join(' - ')}\n`;
		}
		return str;
	}

	let str = `**Requirements for ${diary.name} Diary**\n`;

	for (const tier of [diary.easy, diary.medium, diary.hard, diary.elite]) {
		let thisStr = `**${tier.name}**\n`;
		thisStr += `- Skill Reqs: ${formatSkillRequirements(tier.skillReqs, false)}\n`;

		if (tier.ownedItems) {
			thisStr += `- Must Own: ${tier.ownedItems.map(itemNameFromID).join(', ')}\n`;
		}

		if (tier.collectionLogReqs) {
			thisStr += `- Must Have in CL: ${tier.collectionLogReqs.map(itemNameFromID).join(', ')}\n`;
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
			const entries = Object.entries(tier.monsterScores);
			for (const [name, score] of entries) {
				const mon = Monsters.find(mon => mon.name === name)!;
				thisStr += `- Must Have **${score}** KC of ${mon.name}\n`;
			}
		}

		if (tier.customReq) {
			const [hasCustomReq, reason] = await tier.customReq(user, true, stats);
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

	for (const tier of ['easy', 'medium', 'hard', 'elite'] as const) {
		const diaryTier = diary[tier];
		const [canDo, reason] = await userhasDiaryTier(user, diaryTier);
		const name = `${toTitleCase(diaryTier.name)} ${diary.name} Diary`;
		let hasItems = true;
		const loot = new Bank();

		if (canDo) {
			for (const item of diaryTier.items) {
				if (!allItems.has(item.id)) {
					hasItems = false;
					loot.add(item.id);
				}
			}

			if (hasItems) continue;

			const hasCompleted = await howManyOfTierCompleted(
				user,
				diaries.map(d => d[tier])
			);

			if (cl.amount(lampRewards[diaryTier.name]) < hasCompleted) {
				loot.add(lampRewards[diaryTier.name]);
			}

			await user.addItemsToBank({
				items: loot,
				collectionLog: true
			});

			return `You successfully completed the ${name} and received ${loot}.`;
		}

		return `You can't claim the ${name} because: \n- ${reason}.`;
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
