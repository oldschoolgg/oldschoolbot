import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

const TzHaarXilTable = new LootTable()
	.oneIn(512, 'Toktz-xil-ul', [9, 29])
	.oneIn(512, 'Toktz-xil-ak')
	.oneIn(512, 'Toktz-xil-ek')
	.oneIn(512, 'Obsidian cape')
	.add('Tokkul', [1, 59], 10)
	.add('Uncut sapphire', 2)
	.add('Uncut emerald', 2)
	.add('Uncut ruby', 2)
	.add('Uncut diamond');

export const TzHaarXil = new SimpleMonster({
	id: 2168,
	name: 'TzHaar-Xil',
	table: TzHaarXilTable,
	aliases: ['tzhaar-xil', 'xil']
});
