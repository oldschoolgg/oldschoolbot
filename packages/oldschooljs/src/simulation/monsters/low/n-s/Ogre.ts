import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import { UncommonSeedDropTable } from '../../../subtables/index';

const OgreTable = new LootTable({ limit: 128 })
	.every('Big bones')

	/* Seeds */
	.add(UncommonSeedDropTable, 1, 19)

	/* Tertiary, Averaged mossy key */
	.tertiary(30, 'Ensouled ogre head')
	.tertiary(400, 'Long bone')
	.tertiary(5013, 'Curved bone');

export default new SimpleMonster({
	id: 136,
	name: 'Ogre',
	table: OgreTable,
	aliases: ['ogre']
});
