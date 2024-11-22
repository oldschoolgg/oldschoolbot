import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const GuardBanditTable = new LootTable().every('Bones');

export default new SimpleMonster({
	id: 1027,
	name: 'Guard Bandit',
	table: GuardBanditTable,
	aliases: ['guard bandit']
});
