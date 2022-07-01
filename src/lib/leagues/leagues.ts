/* eslint-disable @typescript-eslint/no-unused-vars */
import { activity_type_enum, Minigame, PlayerOwnedHouse } from '@prisma/client';
import { writeFileSync } from 'fs';
import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import Monster from 'oldschooljs/dist/structures/Monster';

import { UserFullGearSetup } from '../gear';
import creatures from '../skilling/skills/hunter/creatures';
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
	clueScores: ItemBank;
	creatureScores: ItemBank;
	activityCounts: Record<activity_type_enum, number>;
	slayerTasksCompleted: number;
	minigames: Minigame;
	opens: Bank;
	disassembledItems: Bank;
}

export interface Task {
	id: number;
	name: string;
	has: (opts: HasFunctionArgs) => Promise<boolean>;
}

export function leaguesHasKC(args: HasFunctionArgs, mon: Monster, amount = 1) {
	return (args.monsterScores[mon.id] ?? 0) >= amount;
}

export function leaguesHasCatches(args: HasFunctionArgs, name: string, amount = 1) {
	const creature = creatures.find(i => stringMatches(i.name, name));
	if (!creature) throw new Error(`${name} is not a creature`);
	return (args.creatureScores[creature.id] ?? 0) >= amount;
}

const a = [
	{ name: 'Easy', tasks: easyTasks },
	{ name: 'Medium', tasks: mediumTasks },
	{ name: 'Hard', tasks: hardTasks },
	{ name: 'Elite', tasks: eliteTasks },
	{ name: 'Master', tasks: masterTasks }
];

let totalTasks = 0;
let str = '';
for (const { name, tasks } of a) {
	str += `--------- ${name} (${tasks.length} tasks) -----------\n`;
	for (const task of tasks) {
		str += `${task.name}\n`;
	}
	totalTasks += tasks.length;
	str += '\n\n';
}
str = `There are a total of ${totalTasks} tasks.\n\n${str}`;
writeFileSync('./leagues.txt', Buffer.from(str));
