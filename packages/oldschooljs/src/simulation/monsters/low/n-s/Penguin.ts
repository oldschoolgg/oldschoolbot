import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const PenguinTable = new LootTable().every('Bones');

export default new SimpleMonster({
	id: 2063,
	name: 'Penguin',
	table: PenguinTable,
	aliases: ['penguin']
});
