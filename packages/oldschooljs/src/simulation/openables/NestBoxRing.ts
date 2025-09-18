import { EMPTY_BIRD_NEST_ID } from '@/constants.js';
import LootTable from '@/structures/LootTable.js';
import {SimpleOpenable} from '@/structures/SimpleOpenable.js';

const NestBoxRingTable = new LootTable()
	// source: https://oldschool.runescape.wiki/w/Bird_nest
	.every(EMPTY_BIRD_NEST_ID)
	.add('Sapphire ring', 1, 40)
	.add('Gold ring', 1, 35)
	.add('Emerald ring', 1, 15)
	.add('Ruby ring', 1, 9)
	.add('Diamond ring');

export default new SimpleOpenable({
	id: 12_794,
	name: 'Nest box (ring)',
	aliases: ['nest box (ring)', 'ring nest box', 'nest box ring'],
	table: NestBoxRingTable
});
