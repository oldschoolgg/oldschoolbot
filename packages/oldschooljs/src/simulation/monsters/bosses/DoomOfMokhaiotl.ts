import { MathRNG, type RNGProvider } from 'node-rng';

import { Bank } from '@/structures/Bank.js';
import LootTable from '@/structures/LootTable.js';
import { Monster, type MonsterKillOptions } from '@/structures/Monster.js';

type DoomOfMokhaiotlDelveLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

interface DoomOfMokhaiotlKillOptions extends MonsterKillOptions {
	delveLevel?: DoomOfMokhaiotlDelveLevel;
}

const DoomRegularTable = new LootTable()
	.add('Sun-kissed bones', [18, 75], 12)
	.add('Blessed bone shards', [250, 500], 10)
	.add('Prayer potion(4)', [1, 3], 8)
	.add('Super restore(4)', [1, 2], 6)
	.add('Cooked karambwan', [5, 15], 6)
	.add('Shark', [5, 12], 5)
	.add('Blood rune', [150, 400], 8)
	.add('Soul rune', [150, 400], 8)
	.add('Death rune', [200, 500], 6)
	.add('Runite ore', [2, 8], 5)
	.add('Adamantite ore', [8, 20], 5)
	.add('Gold ore', [25, 75], 4)
	.add('Mahogany plank', [20, 60], 4)
	.add('Yew logs', [35, 100], 4)
	.add('Soft clay', [75, 200], 4)
	.add('Ranarr seed', [1, 2], 3)
	.add('Snapdragon seed', [1, 2], 2)
	.add('Torstol seed', 1, 1);

const doomDelveData: Record<
	DoomOfMokhaiotlDelveLevel,
	{
		quantityModifier: number;
		tearQuantity: number;
		uniqueRate?: number;
		domRate?: number;
		clueRate: number;
		uniqueItems: string[];
	}
> = {
	1: { quantityModifier: -0.5, tearQuantity: 0, clueRate: 75, uniqueItems: [] },
	2: { quantityModifier: -0.35, tearQuantity: 0, uniqueRate: 2500, clueRate: 75, uniqueItems: ['Mokhaiotl cloth'] },
	3: {
		quantityModifier: 0,
		tearQuantity: 50,
		uniqueRate: 2000,
		clueRate: 50,
		uniqueItems: ['Mokhaiotl cloth', 'Eye of ayak']
	},
	4: {
		quantityModifier: 0.05,
		tearQuantity: 60,
		uniqueRate: 1350,
		clueRate: 50,
		uniqueItems: ['Mokhaiotl cloth', 'Eye of ayak', 'Avernic treads']
	},
	5: {
		quantityModifier: 0.1,
		tearQuantity: 70,
		uniqueRate: 810,
		clueRate: 50,
		uniqueItems: ['Mokhaiotl cloth', 'Eye of ayak', 'Avernic treads']
	},
	6: {
		quantityModifier: 0.12,
		tearQuantity: 80,
		uniqueRate: 765,
		domRate: 1000,
		clueRate: 50,
		uniqueItems: ['Mokhaiotl cloth', 'Eye of ayak', 'Avernic treads']
	},
	7: {
		quantityModifier: 0.14,
		tearQuantity: 90,
		uniqueRate: 720,
		domRate: 750,
		clueRate: 50,
		uniqueItems: ['Mokhaiotl cloth', 'Eye of ayak', 'Avernic treads']
	},
	8: {
		quantityModifier: 0.17,
		tearQuantity: 100,
		uniqueRate: 630,
		domRate: 500,
		clueRate: 50,
		uniqueItems: ['Mokhaiotl cloth', 'Eye of ayak', 'Avernic treads']
	}
};

function scaleLoot(bank: Bank, modifier: number): Bank {
	if (modifier === 0) return bank;
	for (const [item, quantity] of bank.items()) {
		bank.set(item.id, Math.max(1, Math.floor(quantity * (1 + modifier))));
	}
	return bank;
}

function rollDoomOfMokhaiotlLoot(delveLevel: DoomOfMokhaiotlDelveLevel, rng: RNGProvider): Bank {
	const data = doomDelveData[delveLevel];
	const loot = scaleLoot(DoomRegularTable.roll(), data.quantityModifier);

	if (data.tearQuantity > 0) loot.add('Demon tear', data.tearQuantity);
	if (data.uniqueRate && data.uniqueItems.length > 0 && rng.roll(data.uniqueRate)) {
		loot.add(rng.pick(data.uniqueItems));
	}
	if (data.domRate && rng.roll(data.domRate)) loot.add('Dom');
	if (rng.roll(data.clueRate)) loot.add('Clue scroll (elite)');

	return loot;
}

class DoomOfMokhaiotlSingleton extends Monster {
	public kill(quantity = 1, options: DoomOfMokhaiotlKillOptions = {}): Bank {
		const rng = options.rng ?? MathRNG;
		const delveLevel = options.delveLevel ?? 8;
		const loot = new Bank();

		for (let i = 0; i < quantity; i++) {
			loot.add(rollDoomOfMokhaiotlLoot(delveLevel, rng));
		}

		return loot;
	}
}

export const DoomOfMokhaiotl: DoomOfMokhaiotlSingleton = new DoomOfMokhaiotlSingleton({
	id: 14_707,
	name: 'Doom of Mokhaiotl',
	aliases: ['doom', 'doom of mokhaiotl', 'mokhaiotl', 'doom mokhaiotl'],
	allItems: [
		...DoomRegularTable.allItems,
		'Mokhaiotl cloth',
		'Eye of ayak',
		'Avernic treads',
		'Demon tear',
		'Dom',
		'Clue scroll (elite)'
	].map(item => (typeof item === 'number' ? item : new Bank().add(item).items()[0][0].id))
});
