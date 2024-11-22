import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const GuardDogTable = new LootTable().every('Bones').tertiary(25, 'Ensouled dog head', 1);

export default new SimpleMonster({
	id: 114,
	name: 'Guard dog',
	table: GuardDogTable,
	aliases: ['guard dog', 'dog', 'dogs']
});
