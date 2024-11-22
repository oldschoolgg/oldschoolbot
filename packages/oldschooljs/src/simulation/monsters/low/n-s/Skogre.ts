import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const SkogreTable = new LootTable().every('Zogre bones').every('Ogre coffin key');

export default new SimpleMonster({
	id: 878,
	name: 'Skogre',
	table: SkogreTable,
	aliases: ['skogre']
});
