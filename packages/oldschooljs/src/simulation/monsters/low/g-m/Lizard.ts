import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import FixedAllotmentSeedTable from '../../../subtables/FixedAllotmentSeedTable';
import HerbDropTable from '../../../subtables/HerbDropTable';
import { GemTable } from '../../../subtables/RareDropTable';

const HerbFireRuneTable = new LootTable().every(HerbDropTable).every('Fire rune', 42);
const SeedWaterskinTable = new LootTable().every(FixedAllotmentSeedTable).every('Waterskin(0)', 2);

export const LizardTable = new LootTable()
	.every('Big bones')

	.tertiary(400, 'Long bone')
	.tertiary(5013, 'Curved bone')

	.oneIn(512, 'Mystic gloves (light)')

	/* Runes */
	.add('Fire rune', 5, 30)
	.add('Fire rune', 42, 4)
	.add('Nature rune', 5, 4)

	/* Herbs */
	.add(HerbFireRuneTable, 1, 10)

	/* Seeds */
	.add(SeedWaterskinTable, 1, 9)

	/* Ores and bars */
	.add('Iron ore', 1, 22)
	.add('Coal', 1, 13)
	.add('Tin ore', 1, 4)
	.add('Copper ore', 1, 3)
	.add('Silver ore', 1, 3)
	.add('Silver bar', 1, 2)
	.add('Mithril ore')

	/* Other */
	.add('Kebab', 1, 13)
	.add('Waterskin(0)', 2, 4)

	/* Subtables */
	.add(GemTable, 1, 4)
	.add(GemTable, 2, 2);

export default new SimpleMonster({
	id: 458,
	name: 'Lizard',
	table: LizardTable,
	aliases: ['lizard']
});
