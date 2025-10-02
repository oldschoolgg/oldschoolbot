import { EBSOMonster } from '@/lib/bso/EBSOMonster.js';
import { setCustomMonster } from '@/lib/bso/monsters/setCustomMonster.js';
import { MysteryBoxes } from '@/lib/bso/openables/tables.js';

import { LootTable, Monsters, RareDropTable } from 'oldschooljs';

export const VasaMagusLootTable = new LootTable()
	.add('Rune pickaxe', [1, 9])
	.add('Rune full helm', [5, 9])
	.add('Rune platelegs', [5, 9])
	.add('Rune 2h sword', [5, 9])
	.add('Rune battleaxe', [5, 9])
	.add('Clue scroll (medium)', [1, 3])
	.add('Dragon longsword', [4, 5])
	.add('Dragon med helm', [4, 5])
	.add('Elder rune', [50, 100])
	.add('Pure essence', [1000, 2000])
	.tertiary(16, RareDropTable)
	.tertiary(19, 'Clue scroll (grandmaster)')
	.tertiary(15, MysteryBoxes)
	.tertiary(1000, 'Jar of magic')
	.tertiary(350, 'Magus scroll')
	.tertiary(350, 'Tattered robes of Vasa')
	.tertiary(9, 'Magical artifact');

export const VasaMagus = setCustomMonster(
	EBSOMonster.VASA_MAGUS,
	'Vasa Magus',
	VasaMagusLootTable,
	Monsters.GeneralGraardor,
	{
		id: EBSOMonster.VASA_MAGUS,
		name: 'Vasa Magus',
		aliases: ['vm', 'vasa', 'vasa magus']
	}
);
