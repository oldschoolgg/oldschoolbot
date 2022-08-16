import { activity_type_enum, Minigame, PlayerOwnedHouse, Tame, User } from '@prisma/client';
import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import Monster from 'oldschooljs/dist/structures/Monster';

import { personalSpellCastStats } from '../../mahoji/lib/abstracted_commands/statCommand';
import { ParsedUnit } from '../clues/stashUnits';
import { UserFullGearSetup } from '../gear';
import { CustomMonster } from '../minions/data/killableMonsters/custom/customMonsters';
import Grimy from '../skilling/skills/herblore/mixables/grimy';
import Potions from '../skilling/skills/herblore/mixables/potions';
import unfinishedPotions from '../skilling/skills/herblore/mixables/unfinishedPotions';
import creatures from '../skilling/skills/hunter/creatures';
import { getSlayerTaskStats } from '../slayer/slayerUtil';
import { ItemBank, Skills } from '../types';
import { stringMatches } from '../util';

export interface HasFunctionArgs {
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
	let data = args.slayerStats.find(i => i.monsterID === mon.id);
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
			if (array.some(i => i.id === item[0].id)) {
				bank.add(item[0].id, item[1]);
			}
		}
	}

	return { herbs, unfPots, pots };
}
