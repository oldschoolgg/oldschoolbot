import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

const TzHaarHurTable = new LootTable({ limit: 195 })
	.add('Tokkul', [3, 7], 182)
	.add('Uncut sapphire', 1, 5)
	.add('Uncut emerald', 1, 4)
	.add('Uncut ruby', 1, 3)
	.add('Uncut diamond', 1, 1)
	.tertiary(176_743, 'Rocky');

export default new SimpleMonster({
	id: 2161,
	name: 'TzHaar-Hur',
	pickpocketTable: TzHaarHurTable,
	aliases: ['tzhaarhur', 'tzhaar hur', 'tzhaar-hur']
});
