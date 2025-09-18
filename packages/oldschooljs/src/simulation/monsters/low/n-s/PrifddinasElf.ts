import LootTable from '@/structures/LootTable.js';
import {SimpleMonster} from '@/structures/Monster.js';
import Elf from '../a-f/Elf.js';

const PrifddinasElfTable = new LootTable()
	.oneIn(35, 'Crystal shard')
	.oneIn(1024, 'Enhanced crystal teleport seed')
	.add(Elf.pickpocketTable!, 1)
	.tertiary(99_175, 'Rocky');

export default new SimpleMonster({
	id: 9076,
	name: 'Prifddinas Elf',
	pickpocketTable: PrifddinasElfTable,
	aliases: ['prif elf', 'elf prif', 'prifddinas elf']
});
