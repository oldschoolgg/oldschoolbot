import { uniqueArr } from '@oldschoolgg/util';
import { MathRNG } from 'node-rng';

import { Bank } from '@/structures/Bank.js';
import LootTable from '@/structures/LootTable.js';
import { Monster, type MonsterKillOptions } from '@/structures/Monster.js';

const YamaUniqueTable = new LootTable({ limit: 5 })
	.add('Soulflame horn', 1, 2)
	.add('Oathplate helm')
	.add('Oathplate chest')
	.add('Oathplate legs');

const SupplyTable = new LootTable()
	.every(new LootTable().add('Pineapple pizza', [3, 4]).add('Wild pie', [3, 4]))
	.every(new LootTable().add('Prayer potion(3)', 2).add('Super restore mix(2)', 2))
	.every(new LootTable().add('Super combat potion(1)').add('Zamorak mix(2)'));

const YamaStandardTable = new LootTable({ limit: 78 })
	.add(SupplyTable, 1, 15)

	.add('Rune chainbody', 8, 5)
	.add('Battlestaff', 40, 4)
	.add('Rune platebody', 8, 3)
	.add('Dragon plateskirt', 1, 2)
	.add('Dragon platelegs', 1, 2)

	.add('Blood rune', 400, 3)
	.add('Law rune', 150, 3)
	.add('Smoke rune', 350, 2)
	.add('Soul rune', 500, 2)
	.add('Soul rune', 1000, 2)
	.add('Fire rune', 40_000)
	.add('Wrath rune', 800)

	.add('Aether catalyst', 850, 7)
	.add('Diabolic worms', 90, 7)
	.add('Barrel of demonic tallow (full)', 1, 5)
	.add('Chasm teleport scroll', 6, 4)
	.add('Emerald', 40, 3)
	.add('Ruby', 40, 3)
	.add('Diamond', 40, 3)
	.add('Onyx bolt tips', 150);

function rollYamaLoot(options: MonsterKillOptions): Bank {
	const rng = options.rng ?? MathRNG;
	const loot = new Bank();

	if (rng.roll(120)) {
		loot.add(YamaUniqueTable.roll());
	} else if (rng.roll(12)) {
		loot.add('Dossier');
	} else if (rng.roll(30)) {
		loot.add('Forgotten lockbox');
	} else if (rng.roll(15)) {
		loot.add('Oathplate shards', 12);
	} else {
		loot.add(YamaStandardTable.roll());
	}

	if (rng.roll(66)) loot.add('Clue scroll (elite)');
	if (rng.roll(2500)) loot.add('Yami');

	return loot;
}

class YamaSingleton extends Monster {
	public kill(quantity = 1, options: MonsterKillOptions = {}): Bank {
		const loot = new Bank();
		for (let i = 0; i < quantity; i++) {
			loot.add(rollYamaLoot(options));
		}
		return loot;
	}
}

export const Yama: YamaSingleton = new YamaSingleton({
	id: 14_157,
	name: 'Yama',
	aliases: ['yama'],
	allItems: uniqueArr(
		[
			...YamaUniqueTable.allItems,
			...YamaStandardTable.allItems,
			'Dossier',
			'Forgotten lockbox',
			'Oathplate shards',
			'Yami',
			'Clue scroll (elite)'
		].map(item => (typeof item === 'number' ? item : new Bank().add(item).items()[0][0].id))
	)
});
