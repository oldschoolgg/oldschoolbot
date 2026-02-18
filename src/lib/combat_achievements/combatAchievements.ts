import { notEmpty, sumArr, uniqueArr } from '@oldschoolgg/toolkit';
import { type Item, Items } from 'oldschooljs';
import { clone } from 'remeda';

import type { activity_type_enum } from '@/prisma/main/enums.js';
import { easyCombatAchievements } from '@/lib/combat_achievements/easy.js';
import { eliteCombatAchievements } from '@/lib/combat_achievements/elite.js';
import { grandmasterCombatAchievements } from '@/lib/combat_achievements/grandmaster.js';
import { hardCombatAchievements } from '@/lib/combat_achievements/hard.js';
import { masterCombatAchievements } from '@/lib/combat_achievements/master.js';
import { mediumCombatAchievements } from '@/lib/combat_achievements/medium.js';
import type { Requirements } from '@/lib/structures/Requirements.js';
import type { ActivityTaskData, TOAOptions } from '@/lib/types/minions.js';
import { assert } from '@/lib/util/logError.js';
import { formatList } from '@/lib/util/smallUtils.js';

const collectMonsterNames = (...achievements: CombatAchievement[][]) => {
	const allMonsterNamesSet = new Set<string>();
	for (const achievementGroup of achievements) {
		for (const achievement of achievementGroup) {
			allMonsterNamesSet.add(achievement.monster);
		}
	}
	return Array.from(allMonsterNamesSet);
};

export const allCAMonsterNames = collectMonsterNames(
	easyCombatAchievements,
	mediumCombatAchievements,
	hardCombatAchievements,
	eliteCombatAchievements,
	masterCombatAchievements,
	grandmasterCombatAchievements
);

type CAType = 'kill_count' | 'mechanical' | 'perfection' | 'restriction' | 'speed' | 'stamina';

export type CombatAchievement = {
	id: number;
	name: string;
	type: CAType;
	monster: string;
	desc: string;
	details?: string;
	activityType?: activity_type_enum;
} & (
	| { requirements: Requirements }
	| {
			rng: {
				chancePerKill: number;
				hasChance: activity_type_enum | ((data: ActivityTaskData, user: MUser) => boolean);
			};
	  }
	| {
			notPossible: true;
	  }
);

interface CARootItem {
	name: 'Easy' | 'Medium' | 'Hard' | 'Elite' | 'Master' | 'Grandmaster';
	length: number;
	tasks: CombatAchievement[];
	staticRewards: { item: Item; reclaimable: boolean }[];
	taskPoints: number;
	rewardThreshold: number;
}

export const caTiers = ['easy', 'medium', 'hard', 'elite', 'master', 'grandmaster'] as const;
export type CATier = (typeof caTiers)[number];
type CARoot = Record<CATier, CARootItem>;

const easy: CARootItem = {
	tasks: easyCombatAchievements,
	length: easyCombatAchievements.length,
	name: 'Easy',
	staticRewards: [
		{ item: Items.getOrThrow("Ghommal's hilt 1"), reclaimable: true },
		{ item: Items.getOrThrow('Antique lamp (easy ca)'), reclaimable: false }
	],
	taskPoints: 1,
	rewardThreshold: easyCombatAchievements.length
};
const medium: CARootItem = {
	tasks: mediumCombatAchievements,
	length: mediumCombatAchievements.length,
	name: 'Medium',
	staticRewards: [
		{ item: Items.getOrThrow("Ghommal's hilt 2"), reclaimable: true },
		{ item: Items.getOrThrow('Antique lamp (medium ca)'), reclaimable: false }
	],
	taskPoints: 2,
	rewardThreshold: easy.rewardThreshold + mediumCombatAchievements.length * 2
};
const hard: CARootItem = {
	tasks: hardCombatAchievements,
	length: hardCombatAchievements.length,
	name: 'Hard',
	staticRewards: [
		{ item: Items.getOrThrow("Ghommal's hilt 3"), reclaimable: true },
		{ item: Items.getOrThrow('Antique lamp (hard ca)'), reclaimable: false }
	],
	taskPoints: 3,
	rewardThreshold: medium.rewardThreshold + hardCombatAchievements.length * 3
};
const elite: CARootItem = {
	tasks: eliteCombatAchievements,
	length: eliteCombatAchievements.length,
	name: 'Elite',
	staticRewards: [
		{ item: Items.getOrThrow("Ghommal's hilt 4"), reclaimable: true },
		{ item: Items.getOrThrow('Antique lamp (elite ca)'), reclaimable: false }
	],
	taskPoints: 4,
	rewardThreshold: hard.rewardThreshold + eliteCombatAchievements.length * 4
};
const master: CARootItem = {
	tasks: masterCombatAchievements,
	length: masterCombatAchievements.length,
	name: 'Master',
	staticRewards: [
		{ item: Items.getOrThrow("Ghommal's hilt 5"), reclaimable: true },
		{ item: Items.getOrThrow("Ghommal's lucky penny"), reclaimable: true },
		{ item: Items.getOrThrow('Antique lamp (master ca)'), reclaimable: false }
	],
	taskPoints: 5,
	rewardThreshold: elite.rewardThreshold + masterCombatAchievements.length * 5
};
const grandmaster: CARootItem = {
	tasks: grandmasterCombatAchievements,
	length: grandmasterCombatAchievements.length,
	name: 'Grandmaster',
	staticRewards: [
		{ item: Items.getOrThrow("Ghommal's hilt 6"), reclaimable: true },
		{
			item: Items.getOrThrow('Antique lamp (grandmaster ca)'),
			reclaimable: false
		}
	],
	taskPoints: 6,
	rewardThreshold: master.rewardThreshold + grandmasterCombatAchievements.length * 6
};

export const CombatAchievements: CARoot = {
	easy,
	medium,
	hard,
	elite,
	master,
	grandmaster
};

const entries = Object.entries(CombatAchievements);

for (const [, val] of entries) {
	assert(val.tasks.length === val.length, `${val.name} has ${val.tasks.length} tasks, but length is ${val.length}`);
}

export const allCombatAchievementTasks = entries.flatMap(i => i[1].tasks);

const allCATaskIDs = entries.flatMap(i => i[1].tasks.map(t => t.id));
assert(allCATaskIDs.length === new Set(allCATaskIDs).size);
assert(uniqueArr(entries.flatMap(i => i[1].tasks.map(t => t.name))).length === new Set(allCATaskIDs).size);
assert(sumArr(Object.values(CombatAchievements).map(i => i.length)) === allCATaskIDs.length);
const indexesWithRng = entries.flatMap(i => i[1].tasks.filter(t => 'rng' in t));

export const combatAchievementTripEffect = async ({
	data,
	messages,
	user,
	rng
}: {
	data: ActivityTaskData;
	user: MUser;
	messages: string[];
	rng: RNGProvider;
}) => {
	const dataCopy = clone(data);

	let quantity = 1;
	if ('q' in dataCopy) {
		quantity = dataCopy.q;
	} else if ('quantity' in dataCopy && dataCopy.quantity) {
		quantity = dataCopy.quantity;
	}
	if (Number.isNaN(quantity)) return;

	if (data.type === 'TombsOfAmascut') {
		const wipedRoom = (data as TOAOptions).wipedRoom ?? 0;
		const wipedRooms = (Array.isArray(wipedRoom) ? wipedRoom : [wipedRoom]).filter(notEmpty);
		for (let i = 0; i < wipedRooms.length; i++) quantity--;
	} else if (data.type === 'TheatreOfBlood') {
		quantity -= sumArr(data.wipedRooms.map(i => (i !== null ? 1 : 0)));
	} else if (data.type === 'FightCaves') {
		if (data.preJadDeathTime) {
			quantity--;
		}
	}

	const users: MUser[] = await Promise.all(
		'users' in data ? (data.users as string[]).map(id => mUserFetch(id)) : [user]
	);

	for (const user of users) {
		const completedTasks = [];
		let qty = quantity;
		for (const task of indexesWithRng) {
			if (qty === 0) break;
			if (user.user.completed_ca_task_ids.includes(task.id)) continue;
			if (!('rng' in task)) continue;
			const hasChance =
				typeof task.rng.hasChance === 'string'
					? dataCopy.type === task.rng.hasChance
					: task.rng.hasChance(dataCopy, user);
			if (!hasChance) continue;
			for (let i = 0; i < qty; i++) {
				if (rng.roll(task.rng.chancePerKill)) {
					completedTasks.push(task);
					qty--;
					break;
				}
			}
		}

		if (completedTasks.length > 0) {
			messages.push(
				`${users.length === 1 ? 'You' : `${user}`} completed the ${formatList(
					completedTasks.map(i => i.name)
				)} Combat Achievement Task${completedTasks.length > 1 ? 's' : ''}!`
			);
			await user.update({
				completed_ca_task_ids: {
					push: completedTasks.map(t => t.id)
				}
			});
		}
	}
};

export function caToPlayerString(task: CombatAchievement, user: MUser) {
	if (user.user.completed_ca_task_ids.includes(task.id)) {
		return `Completed ✅ ${task.name} - ${task.desc}`;
	}
	if ('notPossible' in task) {
		return `Not Possible ❌ ${task.name} - ${task.desc}`;
	}
	return `Incomplete ❌ ${task.name} - ${task.desc}`;
}

export function nextCATier(points: number): string {
	const nextTier = Object.entries(CombatAchievements).find(([_, ca]) => ca.rewardThreshold > points);
	if (nextTier) {
		const [tier, ca] = nextTier;
		return `You are ${ca.rewardThreshold - points} points away from ${tier} tier rewards`;
	}
	return 'You have completed all reward tiers';
}
