import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import RareDropTable, { GemTable } from '../../../subtables/RareDropTable';

const IronDragonTable = new LootTable()
	.every('Dragon bones')
	.every('Iron bar', 5)

	/* Pre-roll */
	.oneIn(1024, 'Dragon plateskirt')
	.oneIn(1024, 'Dragon platelegs')

	/* Weapons and armour */
	.add('Rune dart(p)', 9, 7)
	.add('Adamant 2h sword', 1, 4)
	.add('Adamant axe', 1, 3)
	.add('Adamant battleaxe', 1, 3)
	.add('Rune knife', 5, 3)
	.add('Adamant sq shield', 1, 1)
	.add('Rune med helm', 1, 1)
	.add('Rune battleaxe', 1, 1)

	/* Runes and ammunition */
	.add('Rune javelin', 4, 20)
	.add('Blood rune', 15, 19)
	.add('Adamant bolts', [2, 12], 6)
	.add('Soul rune', 3, 5)

	/* Coins */
	.add('Coins', 270, 20)
	.add('Coins', 550, 10)
	.add('Coins', 990, 1)

	/* Other */
	.add('Super strength(1)', 1, 8)
	.add('Runite limbs', 1, 5)
	.add('Adamantite bar', 2, 3)
	.add('Curry', 1, 3)

	/* RDT */
	.add(RareDropTable, 1, 2)
	.add(GemTable, 1, 3)

	/* Tertiary */
	.tertiary(128, 'Clue scroll (hard)')
	.tertiary(10_000, 'Draconic visage');

export default new SimpleMonster({
	id: 272,
	name: 'Iron Dragon',
	table: IronDragonTable,
	aliases: ['iron dragon', 'iron d']
});
