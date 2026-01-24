import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

const VyreTable = new LootTable({ limit: 132 })
	.add('Coins', [250, 315], 109)
	.add('Death rune', 2, 8)
	.add('Blood pint', 1, 6)
	.add('Uncut ruby', 1, 5)
	.add('Blood rune', 4, 2)
	.add('Diamond')
	.add('Cooked mystery meat')
	.oneIn(5000, 'Blood shard');

export const Vyre: SimpleMonster = new SimpleMonster({
	id: 9710,
	name: 'Vyre',
	pickpocketTable: VyreTable,
	aliases: ['vyre']
});
