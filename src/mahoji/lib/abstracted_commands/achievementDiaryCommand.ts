import { KlasaUser } from 'klasa';
import { Bank, Monsters } from 'oldschooljs';

import { diaries, DiaryTier, userhasDiaryTier } from '../../../lib/diaries';
import { Minigames } from '../../../lib/settings/minigames';
import { formatSkillRequirements, itemNameFromID, stringMatches, textEffect, toTitleCase } from '../../../lib/util';

const lampRewards = {
	Easy: 'Antique lamp 1',
	Medium: 'Antique lamp 2',
	Hard: 'Antique lamp 3',
	Elite: 'Antique lamp 4'
} as const;

async function howManyOfTierCompleted(user: KlasaUser, tiers: DiaryTier[]) {
	let completed = 0;
	for (const tier of tiers) {
		const [has] = await userhasDiaryTier(user, tier);
		if (has) completed++;
	}
	return completed;
}

export async function achievementDiaryCommand(user: KlasaUser, diaryName: string) {
	const diary = diaries.find(
		d => stringMatches(d.name, diaryName) || d.alias?.some(a => stringMatches(a, diaryName))
	);

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
			str += `**${dir.name}:** ${res
				.map(t => textEffect(t.name, t.has ? 'strikethrough' : 'none'))
				.join(' - ')}\n`;
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
			const [hasCustomReq, reason] = await tier.customReq(user, true);
			if (!hasCustomReq) {
				thisStr += `- Extra Requirements: ${reason}\n`;
			}
		}

		str += `${thisStr}\n`;
	}
	return str;
}

export async function claimAchievementDiaryCommand(user: KlasaUser, diaryName: string) {
	const diary = diaries.find(
		d => stringMatches(d.name, diaryName) || d.alias?.some(a => stringMatches(a, diaryName))
	);

	if (!diary) {
		return `These are the achievement diaries you can claim: ${diaries.map(d => d.name).join(', ')}.`;
	}

	const allItems = user.allItemsOwned();
	const cl = user.cl();

	for (const tier of ['easy', 'medium', 'hard', 'elite'] as const) {
		const diaryTier = diary[tier];
		const [canDo, reason] = await userhasDiaryTier(user, diaryTier);
		const name = `${toTitleCase(diaryTier.name)} ${diary.name} Diary`;

		if (canDo) {
			if (allItems.has(diaryTier.item.id)) continue;
			const hasCompleted = await howManyOfTierCompleted(
				user,
				diaries.map(d => d[tier])
			);
			const loot = new Bank();
			if (cl.amount(lampRewards[diaryTier.name]) < hasCompleted) {
				loot.add(lampRewards[diaryTier.name]);
			}
			loot.add(diaryTier.item.id);

			await user.addItemsToBank({
				items: loot,
				collectionLog: true
			});

			return `You successfully completed the ${name} and received ${loot}.`;
		}

		return `You can't claim the ${name} because ${reason}.`;
	}

	return `You have already completed the entire ${diary.name} diary!`;
}
