import { clAdjustedDroprate } from '@/lib/bso/bsoUtil.js';
import { globalDroprates } from '@/lib/bso/globalDroprates.js';
import { MysteryBoxes } from '@/lib/bso/openables/tables.js';

import { randArrItem, roll } from '@oldschoolgg/rng';
import { SimpleTable } from '@oldschoolgg/toolkit';
import { Bank, type Item, Items, LootTable } from 'oldschooljs';

import { BitField } from '@/lib/constants.js';
import type { Plant } from '@/lib/skilling/types.js';

export const zygomiteSeedMutChance = 15;

interface MutatedSourceItem {
	item: Item;
	zygomite: 'Herbal zygomite' | 'Barky zygomite' | 'Fruity zygomite';
	weight: number;
	surivalChance: number;
}

export const mutatedSourceItems: MutatedSourceItem[] = [
	{
		item: Items.getOrThrow('Papaya tree seed'),
		zygomite: 'Fruity zygomite',
		weight: 6,
		surivalChance: 19
	},
	{
		item: Items.getOrThrow('Palm tree seed'),
		zygomite: 'Fruity zygomite',
		weight: 5,
		surivalChance: 15
	},
	{
		item: Items.getOrThrow('Dragonfruit tree seed'),
		zygomite: 'Fruity zygomite',
		weight: 1,
		surivalChance: 3
	},
	{
		item: Items.getOrThrow('Lantadyme seed'),
		zygomite: 'Herbal zygomite',
		weight: 14,
		surivalChance: 16
	},
	{
		item: Items.getOrThrow('Torstol seed'),
		zygomite: 'Herbal zygomite',
		weight: 13,
		surivalChance: 14
	},
	{
		item: Items.getOrThrow('Dwarf weed seed'),
		zygomite: 'Herbal zygomite',
		weight: 2,
		surivalChance: 3
	},
	{
		item: Items.getOrThrow('Yew seed'),
		zygomite: 'Barky zygomite',
		weight: 17,
		surivalChance: 15
	},
	{
		item: Items.getOrThrow('Magic seed'),
		zygomite: 'Barky zygomite',
		weight: 11,
		surivalChance: 13
	},
	{
		item: Items.getOrThrow('Redwood tree seed'),
		zygomite: 'Barky zygomite',
		weight: 1,
		surivalChance: 2
	}
];

function sourceItemsToTable(items: MutatedSourceItem[]) {
	const table = new SimpleTable<MutatedSourceItem>();
	for (const item of items) {
		table.add(item, item.weight);
	}
	return table;
}

export const zygomiteFarmingSource = [
	{
		name: 'Herbal zygomite',
		mutatedFromItems: sourceItemsToTable(mutatedSourceItems.filter(m => m.zygomite === 'Herbal zygomite')),
		seedItem: Items.getOrThrow('Herbal zygomite spores'),
		lootTable: new LootTable()
			.every(
				new LootTable().add('Mushroom spore').add('Mort myre fungus', [40, 100]).add('Mushroom', [20, 50]),
				5
			)
			.every(new LootTable().add('Torstol').add('Dwarf weed').add('Cadantine').add('Kwuarm'), [40, 100])
			.every(MysteryBoxes)
	},
	{
		name: 'Barky zygomite',
		mutatedFromItems: sourceItemsToTable(mutatedSourceItems.filter(m => m.zygomite === 'Barky zygomite')),
		seedItem: Items.getOrThrow('Barky zygomite spores'),
		lootTable: new LootTable()
			.every(
				new LootTable().add('Mushroom spore').add('Mort myre fungus', [40, 100]).add('Mushroom', [20, 50]),
				5
			)
			.every(new LootTable().add('Elder logs').add('Mahogany logs'), [50, 100])
			.every(MysteryBoxes)
	},
	{
		name: 'Fruity zygomite',
		mutatedFromItems: sourceItemsToTable(mutatedSourceItems.filter(m => m.zygomite === 'Fruity zygomite')),
		seedItem: Items.getOrThrow('Fruity zygomite spores'),
		lootTable: new LootTable()
			.every(
				new LootTable().add('Mushroom spore').add('Mort myre fungus', [40, 100]).add('Mushroom', [20, 50]),
				5
			)
			.every(new LootTable().add('Avocado').add('Mango').add('Papaya fruit').add('Lychee'), [50, 150])
			.every(MysteryBoxes)
	},
	{
		name: 'Toxic zygomite',
		mutatedFromItems: null,
		seedItem: Items.getOrThrow('Toxic zygomite spores'),
		lootTable: null
	}
];

export const zygomitePlants: Plant[] = zygomiteFarmingSource.map(src => ({
	id: src.seedItem.id,
	level: 105,
	plantXp: 181.5,
	checkXp: 0,
	harvestXp: 927.7,
	inputItems: new Bank().add(src.seedItem.id),
	name: src.name,
	aliases: [src.name.toLowerCase()],
	petChance: 7500,
	seedType: 'mushroom' as const,
	growthTime: 240,
	numOfStages: 6,
	chance1: 0,
	chance99: 0,
	chanceOfDeath: 5,
	needsChopForHarvest: false,
	fixedOutput: true,
	fixedOutputAmount: 6,
	givesLogs: false,
	givesCrops: true,
	defaultNumOfPatches: 0,
	canPayFarmer: false,
	canCompostPatch: true,
	canCompostandPay: false,
	additionalPatchesByQP: [[1, 1]],
	additionalPatchesByFarmLvl: [],
	additionalPatchesByFarmGuildAndLvl: [],
	timePerPatchTravel: 10,
	timePerHarvest: 5,
	noArcaneHarvester: true,
	onHarvest: async ({ loot, user, quantity, messages }) => {
		const dropRate = clAdjustedDroprate(
			user,
			'Fungo',
			globalDroprates.fungo.baseRate,
			globalDroprates.fungo.clIncrease
		);
		if (src.lootTable) {
			for (let i = 0; i < quantity; i++) {
				loot.add(src.lootTable.roll());
				if (roll(dropRate)) {
					loot.add('Fungo');
				}
			}
		}
		if (src.name === 'Toxic zygomite' && !user.bitfield.includes(BitField.HasUnlockedVenatrix)) {
			await user.update({
				bitfield: {
					push: BitField.HasUnlockedVenatrix
				}
			});
			messages.push(
				'The toxic zygomite has infected a nearby spider nest, causing them to glow green and run away. Your minion has feeling something bad happened to them.'
			);
		}
	}
}));

export function calculateZygomiteLoot(minutes: number, userBank: Bank) {
	const cost = new Bank();
	const loot = new Bank();

	for (let i = 0; i < minutes; i++) {
		if (roll(zygomiteSeedMutChance)) {
			const randomZyg = randArrItem(zygomiteFarmingSource.filter(z => z.lootTable !== null));
			const sourceSeed = randomZyg.mutatedFromItems?.roll();
			if (!sourceSeed) continue;
			if (userBank.amount(sourceSeed.item.id) < cost.amount(sourceSeed.item.id) + 1) continue;

			cost.add(sourceSeed.item.id);

			if (roll(sourceSeed.surivalChance)) {
				loot.add(randomZyg.seedItem);
			}
		}
	}
	return { cost, loot };
}
