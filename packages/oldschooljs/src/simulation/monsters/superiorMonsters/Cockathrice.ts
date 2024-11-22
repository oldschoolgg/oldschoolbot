import LootTable from '../../../structures/LootTable';
import SimpleMonster from '../../../structures/SimpleMonster';
import { CockatricePreTable } from '../low/a-f/Cockatrice';

const CockathriceTable = new LootTable()
	.every('Bones')
	.every(CockatricePreTable, 3)

	/* Tertiary */
	.tertiary(13, 'Clue scroll (medium)')
	.tertiary(1000, 'Cockatrice head')

	/* Superior Slayer tertiary */
	.tertiary(340, 'Mist battlestaff')
	.tertiary(340, 'Dust battlestaff')
	.tertiary(1190, 'Eternal gem')
	.tertiary(1190, 'Imbued heart');

export default new SimpleMonster({
	id: 7393,
	name: 'Cockathrice',
	table: CockathriceTable,
	aliases: ['cockathrice']
});
