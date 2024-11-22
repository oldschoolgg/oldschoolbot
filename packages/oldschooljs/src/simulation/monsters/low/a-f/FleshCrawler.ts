import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';
import { GemTable } from '../../../subtables/RareDropTable';

export const FleshCrawlerTable = new LootTable()
	/* Runes */
	.add('Body rune', [3, 12], 17)
	.add('Dust rune', [3, 9], 4)
	.add('Fire rune', 42, 2)
	.add('Nature rune', 5, 2)

	/* Herbs */
	.add(HerbDropTable, 1, 17)

	/* Coins */
	.add('Coins', [5, 84], 7)

	/* Other */
	.add('Iron ore', 1, 5)
	.add('Iron ore', [3, 10], 5)
	.add('Ashes', 1, 4)
	.add('Bottom of sceptre', 1, 3)
	.add('Silver bar', 1, 1)

	/* Gem drop table */
	.add(GemTable, 1, 2);

export default new SimpleMonster({
	id: 2498,
	name: 'Flesh Crawler',
	table: FleshCrawlerTable,
	aliases: ['flesh crawler']
});
