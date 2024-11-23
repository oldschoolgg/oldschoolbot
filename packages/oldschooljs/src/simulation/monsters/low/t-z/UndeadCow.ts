import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const UndeadCowTable = new LootTable().every('Bones').every('Cowhide').every(4287);

export default new SimpleMonster({
	id: 2992,
	name: 'Undead cow',
	table: UndeadCowTable,
	aliases: ['undead cow']
});
