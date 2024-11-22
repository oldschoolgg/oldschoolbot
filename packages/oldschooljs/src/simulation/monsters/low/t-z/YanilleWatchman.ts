import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

const YanilleWatchmanTable = new LootTable().every('Coins', 60).every('Bread').tertiary(134_625, 'Rocky');

export default new SimpleMonster({
	id: 5420,
	name: 'Watchman',
	pickpocketTable: YanilleWatchmanTable,
	aliases: ['yanille', 'watchman', 'yanille watchman']
});
