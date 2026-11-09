import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

const GorakMegaRareTable = new LootTable({ limit: 15 })
	.add('Rune spear', 1, 8)
	.add('Shield left half', 1, 4)
	.add('Dragon spear', 1, 3);

const GorakGemDropTable = new LootTable({ limit: 65 })
	.add('Uncut sapphire', 1, 32)
	.add('Uncut emerald', 1, 16)
	.add('Uncut ruby', 1, 8)
	.add('Nature talisman', 1, 3)
	.add('Uncut diamond', 1, 2)
	.add('Rune javelin', 5, 1)
	.add('Loop half of key')
	.add('Tooth half of key')
	.add(GorakMegaRareTable);

export const GorakTable: LootTable = new LootTable()
	.every('Big bones')
	.every(GorakGemDropTable)
	.oneIn(3, 'Gorak claws')
	.tertiary(128, 'Clue scroll (hard)')
	.tertiary(400, 'Long bone')
	.tertiary(5013, 'Curved bone');

export const Gorak: SimpleMonster = new SimpleMonster({
	id: 1834,
	name: 'Gorak',
	table: GorakTable,
	aliases: ['gorak']
});
