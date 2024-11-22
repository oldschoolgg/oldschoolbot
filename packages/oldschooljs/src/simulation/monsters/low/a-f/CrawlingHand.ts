import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import { GemTable } from '../../../subtables/RareDropTable';

export const CrawlingHandPreTable = new LootTable()
	/* Gloves */
	.add('Leather gloves', 1, 21)
	.add('Purple gloves', 1, 2)
	.add('Yellow gloves', 1, 2)
	.add('Red gloves', 1, 2)
	.add('Teal gloves', 1, 2)

	/* Jewellery */
	.add('Gold ring', 1, 3)
	.add('Sapphire ring', 1, 2)
	.add('Emerald ring', 1, 2)

	/* Coins */
	.add('Coins', 8, 23)
	.add('Coins', 5, 21)

	/* Gem drop table */
	.add(GemTable, 2);

const CrawlingHandTable = new LootTable()
	.every('Bones')
	// 7975 is the correct Crawling hand item
	.tertiary(500, 7975, 1)
	.every(CrawlingHandPreTable);

export default new SimpleMonster({
	id: 448,
	name: 'Crawling Hand',
	table: CrawlingHandTable,
	aliases: ['crawling hand']
});
