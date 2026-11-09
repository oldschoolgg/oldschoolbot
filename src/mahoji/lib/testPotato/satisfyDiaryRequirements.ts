import { stringMatches, uniqueArr } from '@oldschoolgg/toolkit';
import { Bank, convertLVLtoXP } from 'oldschooljs';

import { diaries } from '@/lib/diaries.js';
import { MAX_QP } from '@/lib/minions/data/quests.js';
import Agility from '@/lib/skilling/skills/agility.js';
import type { SafeUserUpdateInput } from '@/lib/user/update.js';

export async function satisfyDiaryRequirements(user: MUser, diaryName: string, tierName: string) {
	const selectedDiary = diaries.find(
		diary => stringMatches(diary.name, diaryName) || diary.alias?.some(alias => stringMatches(alias, diaryName))
	);
	if (!selectedDiary) return 'Invalid diary.';

	const tierOrder = ['easy', 'medium', 'hard', 'elite'] as const;
	const selectedIndex = tierOrder.indexOf(tierName as (typeof tierOrder)[number]);
	if (selectedIndex === -1) return 'Invalid diary tier.';

	const tiersToComplete = tierOrder.slice(0, selectedIndex + 1);
	const userUpdates: SafeUserUpdateInput = {};
	const stats = await user.fetchStats();
	const monsterScores = { ...(stats.monster_scores as Record<string, number>) };
	const lapsScores = { ...(stats.laps_scores as Record<string, number>) };
	const minigameUpdates: Record<string, number> = {};
	const itemsToOwn = new Bank();
	const collectionLogItems = new Bank();

	for (const tierKey of tiersToComplete) {
		const tier = selectedDiary[tierKey];

		for (const [skillName, level] of Object.entries(tier.skillReqs)) {
			if (!level) continue;
			const skill = skillName as keyof typeof user.skillsAsXP;
			const xpRequired = convertLVLtoXP(level);
			if (user.skillsAsXP[skill] < xpRequired) {
				userUpdates[`skills_${skill}`] = xpRequired;
			}
		}

		if (tier.qp && user.QP < tier.qp) {
			userUpdates.QP = Math.max(Number(userUpdates.QP ?? user.QP), tier.qp);
		}

		if (tier.ownedItems) {
			for (const item of tier.ownedItems) itemsToOwn.add(item);
		}

		if (tier.collectionLogReqs) {
			for (const item of tier.collectionLogReqs) collectionLogItems.add(item);
		}

		if (tier.minigameReqs) {
			for (const [minigame, requiredKC] of Object.entries(tier.minigameReqs)) {
				if (!requiredKC) continue;
				minigameUpdates[minigame] = Math.max(minigameUpdates[minigame] ?? 0, requiredKC);
			}
		}

		if (tier.monsterScores) {
			for (const [monsterID, requiredKC] of Object.entries(tier.monsterScores)) {
				if (!requiredKC) continue;
				monsterScores[monsterID] = Math.max(monsterScores[monsterID] ?? 0, requiredKC);
			}
		}

		if (tier.lapsReqs) {
			for (const [courseName, requiredLaps] of Object.entries(tier.lapsReqs)) {
				const agilityCourse = Agility.Courses.find(course => course.name === courseName);
				if (!agilityCourse || !requiredLaps) continue;
				lapsScores[agilityCourse.id] = Math.max(lapsScores[agilityCourse.id] ?? 0, requiredLaps);
			}
		}
	}

	if (selectedDiary.name === 'Falador' && tiersToComplete.includes('elite')) {
		itemsToOwn.add('Quest point cape');
		userUpdates.QP = MAX_QP;
	}

	if (selectedDiary.name === 'Kandarin' && tiersToComplete.includes('elite')) {
		await user.statsUpdate({
			honour_level: {
				set: Math.max(stats.honour_level, 5)
			}
		});
	}

	if (Object.keys(userUpdates).length > 0) {
		await user.update(userUpdates);
	}

	if (itemsToOwn.length > 0) {
		await user.addItemsToBank({ items: itemsToOwn, collectionLog: false });
	}

	if (collectionLogItems.length > 0) {
		await user.addItemsToBank({ items: collectionLogItems, collectionLog: true });
	}

	if (Object.keys(minigameUpdates).length > 0) {
		await prisma.minigame.upsert({
			where: {
				user_id: user.id
			},
			update: minigameUpdates,
			create: {
				user_id: user.id,
				...minigameUpdates
			}
		});
	}

	await user.statsUpdate({
		monster_scores: monsterScores,
		laps_scores: lapsScores
	});

	const diaryKeys = tiersToComplete.map(tier => `${selectedDiary.name}.${tier}`.replace(/\s/g, '').toLowerCase());
	await user.update({
		completed_achievement_diaries: uniqueArr([...user.user.completed_achievement_diaries, ...diaryKeys])
	});

	return `Marked ${selectedDiary.name} ${tierName} diary as completed and added its test requirements.`;
}
