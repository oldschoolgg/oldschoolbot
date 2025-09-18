import LootTable from '@/structures/LootTable.js';
import {SimpleMonster} from '@/structures/Monster.js';

export const PriffRabbit = new LootTable().every('Crystal grail');

export default new SimpleMonster({
	id: 9118,
	name: 'Rabbit',
	table: PriffRabbit,
	aliases: ['rabbit']
});
