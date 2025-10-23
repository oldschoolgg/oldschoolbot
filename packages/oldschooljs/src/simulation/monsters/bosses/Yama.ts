import { EItem } from '@/EItem.js';
import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

const YamaUniqueTable = new LootTable()
	.add('Soulflame horn', 1, 2)
	.add('Oathplate helm', 1, 1)
	.add('Oathplate chest', 1, 1)
	.add('Oathplate legs', 1, 1);

const YamaSupplyDrop = new LootTable()
	.every(new LootTable().add('Pineapple pizza', [3, 4]).add('Wild pie', [3, 4]))
	.every(new LootTable().add('Prayer potion(3)', 2).add('Super restore mix(2)', 2))
	.every(new LootTable().add('Super combat potion(1)', 1).add('Zamorak mix(2)', 1));

const YamaTable = new LootTable()
	.oneIn(120, YamaUniqueTable)
	.oneIn(12, EItem.DOSSIER)
	.oneIn(30, 'Forgotten lockbox')
	.oneIn(15, 'Oathplate shards', 12)
	.add(YamaSupplyDrop, 1, 15)
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
	.add('Fire rune', 40_000, 1)
	.add('Wrath rune', 800, 1)
	.add('Aether catalyst', 850, 7)
	.add('Diabolic worms', 90, 7)
	.add('Barrel of demonic tallow (full)', 1, 5)
	.add('Chasm teleport scroll', 6, 4)
	.add('Emerald', 40, 3)
	.add('Ruby', 40, 3)
	.add('Diamond', 40, 3)
	.add('Onyx bolt tips', 150, 1)
	.tertiary(30, 'Clue scroll (elite)')
	.tertiary(2500, 'Yami');

export const Yama = new SimpleMonster({
	id: 14176,
	name: 'Yama',
	table: YamaTable,
	aliases: ['yama']
});
