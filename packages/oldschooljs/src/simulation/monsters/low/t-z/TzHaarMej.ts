import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

const TzHaarMejTable: LootTable = new LootTable()
	.oneIn(4096, 'Toktz-mej-tal')
	.oneIn(4096, 'Obsidian cape')
	.add('Tokkul', [1, 71], 10)
	.add('Earth rune', 25)
	.add('Fire rune', 25)
	.add('Air rune', 25)
	.add('Chaos rune', 5)
	.add('Nature rune', 2)
	.add('Death rune', 2)
	.add('Uncut diamond', 1);

export const TzHaarMej: SimpleMonster = new SimpleMonster({
	id: 2154,
	name: 'TzHaar-Mej',
	table: TzHaarMejTable,
	aliases: ['tzhaar-mej', 'mej']
});
