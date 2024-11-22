import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

const GoatTable = new LootTable().every('Bones').every('Desert goat horn');

export default new SimpleMonster({
	id: 1792,
	name: 'Goat',
	table: GoatTable,
	aliases: ['goat']
});
