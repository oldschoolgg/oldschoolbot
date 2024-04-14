import { Monsters } from 'oldschooljs';
import RareDropTable from 'oldschooljs/dist/simulation/subtables/RareDropTable';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import { MysteryBoxes } from '../../../../../bsoOpenables';
import setCustomMonster from '../../../../../util/setCustomMonster';

export const VasaMagusLootTable = new LootTable()
	.add('Rune pickaxe', [1, 9])
	.add('Rune full helm', [5, 9])
	.add('Rune platelegs', [5, 9])
	.add('Rune 2h sword', [5, 9])
	.add('Rune battleaxe', [5, 9])
	.add('Clue scroll (medium)', [1, 3])
	.add('Dragon longsword', [5, 4])
	.add('Dragon med helm', [5, 4])
	.add('Elder rune', [50, 100])
	.add('Pure essence', [1000, 2000])
	.tertiary(16, RareDropTable)
	.tertiary(19, 'Clue scroll (grandmaster)')
	.tertiary(15, MysteryBoxes)
	.tertiary(1000, 'Jar of magic')
	.tertiary(350, 'Magus scroll')
	.tertiary(350, 'Tattered robes of Vasa')
	.tertiary(9, 'Magical artifact');

setCustomMonster(294_819, 'Vasa Magus', VasaMagusLootTable, Monsters.GeneralGraardor, {
	id: 294_819,
	name: 'Vasa Magus',
	aliases: ['vm', 'vasa', 'vasa magus']
});

export const VasaMagus = Monsters.find(mon => mon.name === 'Vasa Magus')!;
