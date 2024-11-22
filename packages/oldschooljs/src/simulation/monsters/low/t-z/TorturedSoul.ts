import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import { UncommonSeedDropTable } from '../../../subtables/index';

export const TorturedSoulTable = new LootTable({ limit: 128 })

	/* Runes */
	.add('Body rune', 7, 7)
	.add('Water rune', 6, 6)
	.add('Law rune', 2, 3)

	/* Herbs */
	.add('Grimy harralander', 1, 5)
	.add('Grimy tarromin', 1, 3)
	.add('Grimy marrentill', 1, 2)
	.add('Grimy guam leaf', 1, 1)
	.add('Grimy ranarr weed', 1, 1)

	/* Coins */
	.add('Coins', 3, 30)
	.add('Coins', 2, 21)
	.add('Coins', 6, 3)
	.add('Coins', 5, 3)
	.add('Coins', 2, 2)
	.add('Coins', 12, 1)

	/* Other */
	.add('Limpwurt root', 1, 3)
	.add('Vial of water', 1, 1)

	/* Subtable */
	.add(UncommonSeedDropTable, 1, 20);

export default new SimpleMonster({
	id: 2999,
	name: 'Tortured soul',
	table: TorturedSoulTable,
	aliases: ['tortured soul']
});
