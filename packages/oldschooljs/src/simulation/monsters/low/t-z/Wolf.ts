import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const WolfTable = new LootTable().every('Wolf bones').tertiary(128, 'Clue scroll (beginner)');

export default new SimpleMonster({
	id: 106,
	name: 'Wolf',
	table: WolfTable,
	aliases: ['wolf']
});
