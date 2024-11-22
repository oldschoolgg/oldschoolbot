import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import { HerbDropTable } from '../../../subtables';
import { UncommonSeedDropTable } from '../../../subtables/index';

export const AraxyteTable = new LootTable()
	.every('Araxyte venom sack')
	.tertiary(4000, 'Aranea boots')
	.tertiary(128, 'Clue scroll (hard)')
	.tertiary(2000, 'Araxyte head')

	.add('Coins', [800, 1200], 10)
	.add('Araxyte venom sack', 2, 5)
	.add('Adamant longsword', 1, 5)
	.add('Adamant battleaxe', 1, 5)
	.add('Rune dagger', 1, 3)
	.add('Rune med helm', 1, 2)
	.add('Rune platelegs', 1, 2)

	.add('Air rune', [120, 140], 10)
	.add('Water rune', [120, 140], 10)
	.add('Earth rune', [120, 140], 10)
	.add('Fire rune', [120, 140], 10)
	.add('Cosmic rune', [7, 12], 5)
	.add('Chaos rune', [10, 15], 5)
	.add('Nature rune', [15, 20], 5)
	.add('Death rune', [20, 25], 5)
	.add('Law rune', [12, 15], 5)
	.add('Blood rune', [15, 18], 5)
	.add('Soul rune', [9, 12], 5)
	.add(HerbDropTable, 1, 10)
	.add(UncommonSeedDropTable, 1, 10);

export const Araxyte = new SimpleMonster({
	id: 11175,
	name: 'Araxyte',
	table: AraxyteTable,
	aliases: ['araxyte']
});
