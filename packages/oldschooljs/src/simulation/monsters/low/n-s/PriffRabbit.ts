import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const PriffRabbit: SimpleMonster = new SimpleMonster({
	id: 9118,
	name: 'Rabbit',
	table: new LootTable().every('Crystal grail'),
	aliases: ['rabbit']
});
