import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

const FeverSpiderTable = new LootTable({ limit: 120 }).add('Grimy kwuarm', 10);

export default new SimpleMonster({
	id: 626,
	name: 'Fever spider',
	table: FeverSpiderTable,
	aliases: ['fever spider']
});
