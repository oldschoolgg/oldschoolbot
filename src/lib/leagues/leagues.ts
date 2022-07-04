/* eslint-disable @typescript-eslint/no-unused-vars */
import { activity_type_enum, Minigame, PlayerOwnedHouse, Tame, User } from '@prisma/client';
import { calcWhatPercent } from 'e';
import { writeFileSync } from 'fs';
import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import Monster from 'oldschooljs/dist/structures/Monster';

import { getPOH } from '../../mahoji/lib/abstracted_commands/pohCommand';
import { getSkillsOfMahojiUser, getUserGear, mahojiUsersSettingsFetch } from '../../mahoji/mahojiSettings';
import { UserFullGearSetup } from '../gear';
import { CustomMonster } from '../minions/data/killableMonsters/custom/customMonsters';
import { getMinigameEntity } from '../settings/minigames';
import { prisma } from '../settings/prisma';
import creatures from '../skilling/skills/hunter/creatures';
import { getSlayerTaskStats } from '../slayer/slayerUtil';
import { getAllUserTames } from '../tames';
import { ItemBank, Skills } from '../types';
import { stringMatches } from '../util';
import { easyTasks } from './easyTasks';
import { eliteTasks } from './eliteTasks';
import { hardTasks } from './hardTasks';
import { masterTasks } from './masterTasks';
import { mediumTasks } from './mediumTasks';

// type LeagueTier = 'beginner' | 'easy' | 'medium' | 'hard' | 'elite' | 'master';

interface HasFunctionArgs {
	cl: Bank;
	bank: Bank;
	user: KlasaUser;
	lapScores: ItemBank;
	skillsLevels: Required<Skills>;
	skillsXP: Required<Skills>;
	poh: PlayerOwnedHouse;
	gear: UserFullGearSetup;
	allItemsOwned: Bank;
	monsterScores: ItemBank;
	creatureScores: ItemBank;
	activityCounts: Record<activity_type_enum, number>;
	slayerTasksCompleted: number;
	minigames: Minigame;
	opens: Bank;
	disassembledItems: Bank;
	mahojiUser: User;
	tames: Tame[];
	sacrificedBank: Bank;
	slayerStats: Awaited<ReturnType<typeof getSlayerTaskStats>>;
}

export interface Task {
	id: number;
	name: string;
	has: (opts: HasFunctionArgs) => Promise<boolean>;
}

export function leaguesHasKC(args: HasFunctionArgs, mon: Monster | CustomMonster, amount = 1) {
	return (args.monsterScores[mon.id] ?? 0) >= amount;
}

export function leaguesHasCatches(args: HasFunctionArgs, name: string, amount = 1) {
	const creature = creatures.find(i => stringMatches(i.name, name));
	if (!creature) throw new Error(`${name} is not a creature`);
	return (args.creatureScores[creature.id] ?? 0) >= amount;
}

export function leaguesSlayerTaskForMonster(args: HasFunctionArgs, mon: Monster | CustomMonster, amount = 1) {
	let data = args.slayerStats.find(i => i.monsterID === mon.id);
	return data !== undefined && data.total_tasks >= amount;
}

const a = [
	{ name: 'Easy', tasks: easyTasks },
	{ name: 'Medium', tasks: mediumTasks },
	{ name: 'Hard', tasks: hardTasks },
	{ name: 'Elite', tasks: eliteTasks },
	{ name: 'Master', tasks: masterTasks }
];

let taskIDs = new Set();

let totalTasks = 0;
let str = '';
for (const { name, tasks } of a) {
	str += `--------- ${name} (${tasks.length} tasks) -----------\n`;
	for (const task of tasks) {
		if (taskIDs.has(task.id)) throw new Error(`WTFFFFFFFFFFF: ${task.id}`);
		taskIDs.add(task.id);
		str += `${task.name}\n`;
	}
	totalTasks += tasks.length;
	str += '\n\n';
}
str = `There are a total of ${totalTasks} tasks.\n\n${str}`;
writeFileSync('./leagues.txt', Buffer.from(str));

async function getActivityCounts(userID: string) {
	const result: { type: activity_type_enum; count: bigint }[] = await prisma.$queryRaw`SELECT type, COUNT(type)
FROM activity
WHERE user_id = ${Number(userID)}
GROUP BY type;`;
	const parsed = result.map(i => ({ type: i.type, count: Number(i.count) }));
	// @ts-ignore trust me
	let rec: Record<activity_type_enum, number> = {};
	for (const a of Object.values(activity_type_enum)) {
		rec[a] = 0;
	}
	for (const a of parsed) {
		rec[a.type] = a.count;
	}
	return rec;
}

export async function leaguesCheckUser(userID: string) {
	const klasaUser = await globalClient.fetchUser(userID);
	const mahojiUser = await mahojiUsersSettingsFetch(userID);

	const args: HasFunctionArgs = {
		cl: new Bank(mahojiUser.collectionLogBank as ItemBank),
		bank: new Bank(mahojiUser.bank as ItemBank),
		user: klasaUser,
		mahojiUser,
		skillsLevels: getSkillsOfMahojiUser(mahojiUser, true),
		skillsXP: getSkillsOfMahojiUser(mahojiUser, false),
		poh: await getPOH(userID),
		gear: getUserGear(mahojiUser),
		allItemsOwned: klasaUser.allItemsOwned(),
		monsterScores: mahojiUser.monsterScores as ItemBank,
		creatureScores: mahojiUser.creatureScores as ItemBank,
		opens: new Bank(mahojiUser.openable_scores as ItemBank),
		disassembledItems: new Bank(mahojiUser.disassembled_items_bank as ItemBank),
		tames: await getAllUserTames(userID),
		sacrificedBank: new Bank(mahojiUser.sacrificedBank as ItemBank),
		slayerStats: await getSlayerTaskStats(userID),
		activityCounts: await getActivityCounts(userID),
		minigames: await getMinigameEntity(userID),
		lapScores: mahojiUser.lapsScores as ItemBank,
		slayerTasksCompleted: await prisma.slayerTask.count({ where: { user_id: userID } })
	};

	let resStr = '';
	let totalTasks = 0;
	let totalFinished = 0;

	for (const { name, tasks } of a) {
		const finished: Task[] = [];
		const notFinished: Task[] = [];
		totalTasks += tasks.length;
		for (const task of tasks) {
			const has = await task.has(args);
			if (has) {
				finished.push(task);
			} else {
				notFinished.push(task);
			}
		}
		totalFinished += finished.length;
		// resStr += `-------- ${name} ---------`;
		// resStr += `Finished ${finished.length} tasks: ${finished.map(i => i.name).join(', ')}\n`;
		// resStr += `Not Finished ${notFinished.length} tasks: ${notFinished.map(i => i.name).join(', ')}`;
		// resStr += '--------------------------';
		// resStr += '\n\n';
		resStr += `${name}: Finished ${finished.length}/${tasks.length}\n`;
	}

	return `${calcWhatPercent(totalFinished, totalTasks).toFixed(1)}% Completion

${resStr}`;
}
