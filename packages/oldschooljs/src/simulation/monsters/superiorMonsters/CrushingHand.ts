import LootTable from '../../../structures/LootTable';
import SimpleMonster from '../../../structures/SimpleMonster';
import { CrawlingHandPreTable } from '../low/a-f/CrawlingHand';

const CrushingHandTable = new LootTable()
	.every('Bones')
	.tertiary(500, 'Crawling hand', 1)
	.every(CrawlingHandPreTable, 3)

	/* Superior Slayer tertiary */
	.tertiary(391, 'Mist battlestaff')
	.tertiary(391, 'Dust battlestaff')
	.tertiary(1370, 'Eternal gem')
	.tertiary(1370, 'Imbued heart');

export default new SimpleMonster({
	id: 7388,
	name: 'Crushing hand',
	table: CrushingHandTable,
	aliases: ['crushing hand']
});
