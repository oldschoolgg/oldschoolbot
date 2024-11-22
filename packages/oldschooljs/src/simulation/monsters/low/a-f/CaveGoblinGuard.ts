import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

const ClubOrSpearTable = new LootTable().add('Bone club').add('Bone spear');

const CaveGoblinGuardTable = new LootTable({ limit: 128 })
	.every('Bones')
	.tertiary(5000, 'Goblin champion scroll')

	/* Weapons and armour */
	.add(ClubOrSpearTable, 1, 20)
	.add('Iron chainbody', 1, 20)

	/* Other */
	.add('Coins', 12, 20)
	.add('Oil lantern', 1, 20)
	.add('Tinderbox', 1, 20);

export default new SimpleMonster({
	id: 5334,
	name: 'Cave goblin guard',
	table: CaveGoblinGuardTable,
	aliases: ['cave goblin guard']
});
