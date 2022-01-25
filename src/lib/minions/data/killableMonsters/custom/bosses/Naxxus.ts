import { Monsters } from 'oldschooljs';
import RareDropTable from 'oldschooljs/dist/simulation/subtables/RareDropTable';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import { MysteryBoxes } from '../../../../../data/openables';
import setCustomMonster from '../../../../../util/setCustomMonster';

export const NaxxusLootTable = new LootTable()
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
	.tertiary(12, 'Clue scroll (grandmaster)')
	.tertiary(15, MysteryBoxes)
	.tertiary(1000, 'Jar of magic')
	.tertiary(500, 'Voidling')
	.tertiary(350, 'Magus scroll')
	.tertiary(350, 'Tattered robes of Vasa')
	.tertiary(9, 'Magical artifact');

setCustomMonster(294_820, 'Naxxus', NaxxusLootTable, Monsters.GeneralGraardor, {
	id: 294_820,
	name: 'Naxxus',
	aliases: ['naxx']
});

export const Naxxus = Monsters.find(mon => mon.name === 'Naxxus')!;
