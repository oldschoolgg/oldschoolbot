import { roll } from '@oldschoolgg/rng';
import { Time } from '@oldschoolgg/toolkit';
import { Bank, LootTable } from 'oldschooljs';

export const EITEMS = {
	WabbitEggs: 74_010,
	Magnegg: 74_011,
	Magnabbit: 74_012
} as const;

const passiveEasterLootTable = new LootTable().add('Carrot').add('Egg').add('Easter egg').add('Chocolate bar');

const easterTurnInLootTable = new LootTable()
	.add('Carrot')
	.add('Egg')
	.add('Easter egg')
	.add('Chocolate bar')
	.add('Easter basket')
	.add('Bunny ears')
	.add('Giant easter egg');

const easterTurnInCosmeticTable = new LootTable();
for (const item of [
	...Array.from({ length: 14 }, (_, i) => `Easter egg (${i + 1})`),
	'Easter cape (1)',
	'Easter cape (2)',
	'Monkey egg (Edible)',
	'Easter Bunny hat',
	'Easter Bunny top',
	'Easter Bunny legs',
	'Easter Bunny gloves',
	'Easter Bunny boots',
	'Easter Bunny tail',
	'Elven bunny ears',
	'Dragon bunny ears',
	'Tzhaar bunny ears',
	'Rune bunny ears',
	'Vyrewatch bunny ears',
	'Arceuus bunny ears',
	'Waddles',
	'Tasty'
]) {
	easterTurnInCosmeticTable.add(item);
}

export interface PassiveEasterLootResult {
	genericLoot: Bank;
	loot: Bank;
	magneggs: number;
	wabbitEggs: number;
}

export function rollPassiveEasterLoot(duration: number): PassiveEasterLootResult | null {
	const minutes = Math.floor(duration / Time.Minute);
	if (minutes < 1) return null;

	const genericLoot = new Bank();
	let magneggs = 0;
	let wabbitEggs = 0;

	for (let i = 0; i < minutes; i++) {
		if (!roll(60)) continue;
		wabbitEggs++;
		genericLoot.add(passiveEasterLootTable.roll());
		if (roll(50)) {
			magneggs++;
		}
	}

	if (wabbitEggs === 0) return null;

	const loot = new Bank().add(genericLoot).add(EITEMS.WabbitEggs, wabbitEggs);
	if (magneggs > 0) {
		loot.add(EITEMS.Magnegg, magneggs);
	}

	return {
		genericLoot,
		loot,
		magneggs,
		wabbitEggs
	};
}

export function rollEasterTurnInLoot(quantity: number) {
	const loot = new Bank();
	let magneggs = 0;

	for (let i = 0; i < quantity; i++) {
		loot.add(easterTurnInLootTable.roll());
		if (roll(35)) {
			loot.add(easterTurnInCosmeticTable.roll());
		}
		if (roll(50)) {
			magneggs++;
		}
	}

	if (magneggs > 0) {
		loot.add(EITEMS.Magnegg, magneggs);
	}

	return {
		loot,
		magneggs
	};
}
