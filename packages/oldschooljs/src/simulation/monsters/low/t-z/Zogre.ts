import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const ZogreTable = new LootTable()
	.every('Zogre bones')
	.every('Ogre coffin key')
	.tertiary(5000, 'Zombie champion scroll');

export default new SimpleMonster({
	id: 866,
	name: 'Zogre',
	table: ZogreTable,
	aliases: ['zogre']
});
