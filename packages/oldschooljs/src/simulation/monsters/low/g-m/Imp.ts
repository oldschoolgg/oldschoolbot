import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const ImpTable = new LootTable()
	.tertiary(5000, 'Imp champion scroll')
	.tertiary(25, 'Ensouled imp head')
	.every('Fiendish ashes')
	.add('Black bead', 1, 5)
	.add('Red bead', 1, 5)
	.add('White bead', 1, 5)
	.add('Yellow bead', 1, 5)
	.add('Bronze bolts', 1, 8)
	.add('Blue wizard hat', 1, 8)

	// Food
	.add('Egg', 1, 5)
	.add('Raw chicken', 1, 5)
	.add('Burnt bread', 1, 4)
	.add('Burnt meat', 1, 4)
	.add('Cabbage', 1, 2)
	.add('Bread dough', 1, 2)
	.add('Bread', 1, 1)
	.add('Cooked meat', 1, 1)

	// Tools
	.add('Hammer', 1, 8)
	.add('Tinderbox', 1, 5)
	.add('Shears', 1, 4)
	.add('Bucket', 1, 4)
	.add('Bucket of water', 1, 2)
	.add('Jug', 1, 2)
	.add('Jug of water', 1, 2)
	.add('Pot', 1, 2)
	.add('Pot of flour', 1, 2)

	// Other
	.add('Ball of wool', 1, 8)
	.add('Mind talisman', 1, 7)
	.add('Ashes', 1, 6)
	.add('Clay', 1, 4)
	.add('Cadava berries', 1, 4)
	.add('Grain', 1, 3)
	.add("Chef's hat", 1, 2)
	.add('Flyer', 1, 2)
	.add('Potion', 1, 1);

export default new SimpleMonster({
	id: 5007,
	name: 'Imp',
	table: ImpTable,
	aliases: ['imp']
});
