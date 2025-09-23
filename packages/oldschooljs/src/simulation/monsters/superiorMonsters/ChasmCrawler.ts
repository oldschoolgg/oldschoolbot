import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';
import { CaveCrawlerTable } from '../low/a-f/CaveCrawler.js';

const ChasmCrawlerTable = new LootTable()
	.every(CaveCrawlerTable, 3)

	/* Superior Slayer tertiary */
	.tertiary(380, 'Mist battlestaff')
	.tertiary(380, 'Dust battlestaff')
	.tertiary(1330, 'Eternal gem')
	.tertiary(1330, 'Imbued heart');

export default new SimpleMonster({
	id: 7389,
	name: 'Chasm Crawler',
	table: ChasmCrawlerTable,
	aliases: ['chasm crawler']
});
