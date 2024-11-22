import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import FixedAllotmentSeedTable from '../../../subtables/FixedAllotmentSeedTable';
import HerbDropTable from '../../../subtables/HerbDropTable';
import { GemTable } from '../../../subtables/RareDropTable';

export const SulphurLizardTable = new LootTable()
	.every('Bones')
	.oneIn(512, 'Mystic gloves (light)')
	.tertiary(128, 'Clue scroll (medium)')

	/* Runes */
	.add('Fire rune', [10, 25], 26)
	.add('Fire rune', [40, 60], 4)
	.add('Nature rune', [5, 10], 4)

	/* Ores and bars */
	.add('Iron ore', [5, 10], 22)
	.add('Coal', [5, 10], 13)
	.add('Iron bar', [6, 10], 4)
	.add('Steel bar', [3, 5], 4)
	.add('Tin ore', [10, 15], 4)
	.add('Copper ore', [10, 15], 3)
	.add('Silver ore', [5, 10], 3)
	.add('Silver bar', [3, 5], 2)
	.add('Mithril ore', [3, 5], 1)

	/* Herbs */
	.add(HerbDropTable, 1, 10)

	/* Seeds */
	.add(FixedAllotmentSeedTable, 1, 9)

	/* Other */
	.add('Rainbow fish', 1, 13)

	/* Subtables */
	.add(GemTable, 1, 4)
	.add(GemTable, 2, 2);

export default new SimpleMonster({
	id: 8614,
	name: 'Sulphur Lizard',
	table: SulphurLizardTable,
	aliases: ['sulphur lizard']
});
