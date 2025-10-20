import type { CustomMonster } from '@/lib/bso/monsters/CustomMonster.js';
import type { MTame } from '@/lib/bso/structures/MTame.js';

import { stringMatches } from '@oldschoolgg/toolkit';
import { Bank, type ItemBank, type Monster } from 'oldschooljs';

import type { activity_type_enum, Minigame, PlayerOwnedHouse, User, UserStats } from '@/prisma/main.js';
import type { UserFullGearSetup } from '@/lib/gear/types.js';
import Grimy from '@/lib/skilling/skills/herblore/mixables/grimy.js';
import Potions from '@/lib/skilling/skills/herblore/mixables/potions.js';
import unfinishedPotions from '@/lib/skilling/skills/herblore/mixables/unfinishedPotions.js';
import creatures from '@/lib/skilling/skills/hunter/creatures/index.js';
import type { getSlayerTaskStats } from '@/lib/slayer/slayerUtil.js';
import type { Skills } from '@/lib/types/index.js';
import type { ParsedUnit } from '@/mahoji/lib/abstracted_commands/stashUnitsCommand.js';
import type { personalSpellCastStats } from '@/mahoji/lib/abstracted_commands/statCommand.js';

export interface HasFunctionArgs {
	cl: Bank;
	bank: Bank;
	user: MUser;
	mahojiUser: User;
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
	tames: MTame[];
	sacrificedBank: Bank;
	slayerStats: Awaited<ReturnType<typeof getSlayerTaskStats>>;
	clPercent: number;
	conStats: Bank;
	woodcuttingStats: Bank;
	alchingStats: Bank;
	herbloreStats: ReturnType<typeof betterHerbloreStats>;
	miningStats: Bank;
	firemakingStats: Bank;
	smithingStats: Bank;
	spellCastingStats: Awaited<ReturnType<typeof personalSpellCastStats>>;
	collectingStats: Bank;
	smithingSuppliesUsed: Bank;
	actualClues: Bank;
	smeltingStats: Bank;
	stashUnits: ParsedUnit[];
	totalLampedXP: number;
	userStats: UserStats;
	fletchedItems: Bank;
	fromScratchDarts: Bank;
}

export interface Task {
	id: number;
	name: string;
	has: (opts: HasFunctionArgs) => Promise<boolean>;
}

export function leaguesHasKC(args: HasFunctionArgs, mon: Monster | CustomMonster | { id: number }, amount = 1) {
	return (args.monsterScores[mon.id] ?? 0) >= amount;
}

export function leaguesHasCatches(args: HasFunctionArgs, name: string, amount = 1) {
	const creature = creatures.find(i => stringMatches(i.name, name));
	if (!creature) throw new Error(`${name} is not a creature`);
	return (args.creatureScores[creature.id] ?? 0) >= amount;
}

export function leaguesSlayerTaskForMonster(args: HasFunctionArgs, mon: Monster | CustomMonster, amount: number) {
	const data = args.slayerStats.find(i => i.monsterID === mon.id);
	return data !== undefined && data.total_tasks >= amount;
}

export function betterHerbloreStats(herbStats: Bank) {
	const herbs = new Bank();
	const unfPots = new Bank();
	const pots = new Bank();

	for (const item of herbStats.items()) {
		for (const [array, bank] of [
			[Grimy, herbs],
			[unfinishedPotions, unfPots],
			[Potions, pots]
		] as const) {
			if (array.some(i => i.item.id === item[0].id)) {
				bank.add(item[0].id, item[1]);
			}
		}
	}

	return { herbs, unfPots, pots };
}
