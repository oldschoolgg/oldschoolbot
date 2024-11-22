import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const DeathWingTable = new LootTable().tertiary(128, 'Clue scroll (beginner)');

export default new SimpleMonster({
	id: 509,
	name: 'Death wing',
	table: DeathWingTable,
	aliases: ['death wing']
});
