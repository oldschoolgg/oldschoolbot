import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const WildDogTable = new LootTable().every('Bones').tertiary(25, 'Ensouled dog head');

export default new SimpleMonster({
	id: 112,
	name: 'Wild dog',
	table: WildDogTable,
	aliases: ['wild dog']
});
