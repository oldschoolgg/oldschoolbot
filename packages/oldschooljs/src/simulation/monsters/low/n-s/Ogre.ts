import { UncommonSeedDropTable } from '@/simulation/subtables/index.js';
import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

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
