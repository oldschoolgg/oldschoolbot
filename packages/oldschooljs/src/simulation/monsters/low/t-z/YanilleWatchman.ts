import LootTable from '@/structures/LootTable.js';
import {SimpleMonster} from '@/structures/Monster.js';

const YanilleWatchmanTable = new LootTable().every('Coins', 60).every('Bread').tertiary(134_625, 'Rocky');

export default new SimpleMonster({
	id: 5420,
	name: 'Watchman',
	pickpocketTable: YanilleWatchmanTable,
	aliases: ['yanille', 'watchman', 'yanille watchman']
});
