import LootTable from '@/structures/LootTable.js';
import {SimpleMonster} from '@/structures/Monster.js';

export const PhrinShadeTable = new LootTable().every('Phrin remains');

export default new SimpleMonster({
	id: 1280,
	name: 'Phrin Shade',
	table: PhrinShadeTable,
	aliases: ['phrin shade']
});
