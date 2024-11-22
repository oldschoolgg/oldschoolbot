import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const GhoulTable = new LootTable().tertiary(5000, 'Ghoul champion scroll').every('Bones');

export default new SimpleMonster({
	id: 289,
	name: 'Ghoul',
	table: GhoulTable,
	aliases: ['ghoul']
});
