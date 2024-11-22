import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

const CrocodileTable = new LootTable()
	.every('Babydragon bones')
	.tertiary(400, 'Long bone')
	.tertiary(5013, 'Curved bone');

export default new SimpleMonster({
	id: 4184,
	name: 'Crocodile',
	table: CrocodileTable,
	aliases: ['crocodile']
});
