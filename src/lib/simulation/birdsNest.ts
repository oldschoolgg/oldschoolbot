import LootTable from 'oldschooljs/dist/structures/LootTable';

// chance at a type of seed
const SeedNestTable = new LootTable()
	.every('crushed nest')
	.add('Acorn', 1, 32)
	.add('Apple tree seed', 1, 32)
	.add('Banana tree seed', 1, 32)
	.add('Orange tree seed', 1, 16)
	.add('Willow seed', 1, 16)
	.add('Teak seed', 1, 16)
	.add('Curry tree seed', 1, 16)
	.add('Maple seed', 1, 4)
	.add('Pineapple seed', 1, 4)
	.add('Mahogany seed', 1, 4)
	.add('Papaya tree seed', 1, 4)
	.add('Calquat tree seed', 1, 4)
	.add('Yew seed', 1, 4)
	.add('Magic seed', 1, 1)
	.add('Spirit seed', 1, 2)
	.add('Celastrus seed', 1, 1)
	.add('Redwood tree seed', 1, 1)
	.add('Dragonfruit tree seed', 1, 1);

// chance at a type of ring
const RingTable = new LootTable()
	.every('crushed nest')
	.add('Gold ring', 1, 32)
	.add('Sapphire ring', 1, 32)
	.add('Emerald ring', 1, 16)
	.add('Ruby ring', 1, 8)
	.add('Diamond ring', 1, 2);

// chance at a piece of the evil chicken outfit
const EggTable = new LootTable()
	.add('Evil chicken head', 1, 1)
	.add('Evil chicken wings', 1, 1)
	.add('Evil chicken legs', 1, 1)
	.add('Evil chicken feet', 1, 1)
	.add(SeedNestTable, 1, 296);

// chance at each nest type
const BirdNestTable = new LootTable()
	.add(EggTable, 1, 3)
	.add(SeedNestTable, 1, 66)
	.add(RingTable, 1, 31);

export default BirdNestTable;
