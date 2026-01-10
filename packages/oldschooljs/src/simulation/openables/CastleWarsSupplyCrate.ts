import LootTable from '@/structures/LootTable.js';
import { SimpleOpenable } from '@/structures/SimpleOpenable.js';

const CastleWarsSupplyCrateTable: LootTable = new LootTable()
	.add('Blighted manta ray', [15, 25])
	.add('Blighted anglerfish', [25, 35])
	.add('Blighted karambwan', [35, 45])
	.add('Blighted super restore(4)', 4)
	.add('Blighted ancient ice sack', [10, 15])
	.add('Blighted vengeance sack', [20, 30])
	.add('Castle wars arrow', [75, 105])
	.add('Castle wars bolts', [75, 105])
	.add('Rune arrow', [175, 225])
	.add('Rune javelin', [100, 120])
	.add('Castle wars ticket', 2);

export const CastleWarsSupplyCrate: SimpleOpenable = new SimpleOpenable({
	id: 30_690,
	name: 'Castle wars supply crate',
	aliases: ['castle wars supply crate'],
	table: CastleWarsSupplyCrateTable
});
