import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import { GemTable } from '../../../subtables/RareDropTable';

export const CaveSlimeTable = new LootTable()
	.every('Swamp tar', [1, 6])
	.tertiary(128, 'Clue scroll (easy)')

	.add(GemTable, 1, 4)

	/* Weapons and Armour */
	.add('Iron sword', 1, 7)
	.add('Bronze axe', 1, 3)
	.add('Iron kiteshield', 1, 2)
	.add('Bronze full helm')
	.add('Iron boots')

	/* Runes */
	.add('Water rune', 15, 5)
	.add('Earth rune', 5, 3)

	/* Other */
	.add('Coins', 10, 39)
	.add('Coins', 4, 30)
	.add('Coins', 22, 10)
	.add('Coins', 1, 7)
	.add('Coins', 46, 2)
	.add('Unlit torch', 1, 1)
	.add('Gold bar', 1, 2)
	.add('Oil lantern frame', 1, 1);

export default new SimpleMonster({
	id: 480,
	name: 'Cave Slime',
	table: CaveSlimeTable,
	aliases: ['cave slime']
});
