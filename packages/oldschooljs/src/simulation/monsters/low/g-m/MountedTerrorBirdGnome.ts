import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const MountedTerrorBirdGnomeTable = new LootTable().every('Bones');

export default new SimpleMonster({
	id: 2067,
	name: 'Mounted terrorbird gnome',
	table: MountedTerrorBirdGnomeTable,
	aliases: ['mounted terrorbird', 'mounted terrorbird gnome']
});
