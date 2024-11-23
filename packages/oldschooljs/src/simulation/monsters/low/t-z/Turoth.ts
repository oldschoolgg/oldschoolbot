import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';
import { GemTable } from '../../../subtables/RareDropTable';
import RareSeedTable from '../../../subtables/RareSeedTable';

const TurothHerbTable = new LootTable().add(HerbDropTable, 1, 15).add(HerbDropTable, 2, 10).add(HerbDropTable, 3, 6);

export const TurothPreTable = new LootTable({ limit: 128 })
	/* Weapons and armour */
	.add('Steel platelegs', 1, 7)
	.add('Mithril axe', 1, 3)
	.add('Mithril kiteshield', 1, 1)
	.add('Adamant full helm', 1, 1)
	.add('Rune dagger', 1, 1)
	.oneIn(500, 'Leaf-bladed sword')
	.oneIn(512, 'Mystic robe bottom (light)')

	/* Runes */
	.add('Law rune', 3, 6)
	.add('Nature rune', 15, 5)
	.add('Nature rune', 37, 1)

	/* Herbs */
	.add(TurothHerbTable, 1, 31)

	/* Seeds */
	.add(RareSeedTable, 1, 18)

	/* Materials */
	.add('Limpwurt root', 1, 7)

	/* Other */
	.add('Coins', 44, 29)
	.add('Coins', 132, 12)
	.add('Coins', 440, 1)

	/* RDT */
	.add(GemTable, 1, 5);

const TurothTable = new LootTable()
	.every('Bones')
	.every(TurothPreTable)

	/* Tertiary */
	.tertiary(128, 'Clue scroll (hard)');

export default new SimpleMonster({
	id: 426,
	name: 'Turoth',
	table: TurothTable,
	aliases: ['turoth']
});
