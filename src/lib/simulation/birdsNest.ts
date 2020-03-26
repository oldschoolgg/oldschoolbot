import LootTable from 'oldschooljs/dist/structures/LootTable';
// import itemID from '../util/itemID';

const BirdsNestTable = new LootTable()
	// .every(itemID : 5075)
	.add('Acorn', 1, 1)
	.add('Apple tree seed', 1, 1)
	.add('Banana tree seed', 1, 1)
	.add('Orange tree seed', 1, 4)
	.add('Willow seed', 1, 4)
	.add('Teak seed', 1, 4)
	.add('Curry tree seed', 1, 4)
	.add('Maple seed', 1, 16)
	.add('Pinapple seed', 1, 16)
	.add('Mahogany tree seed', 1, 16)
	.add('Papaya tree seed', 1, 16)
	.add('Calquat tree seed', 1, 16)
	.add('Yew seed', 1, 16)
	.add('Magic seed', 1, 64)
	.add('Spirit seed', 1, 32)
	.add('Celastrus seed', 1, 64)
	.add('Redwood seed', 1, 64)
	.add('Dragonfruit tree seed', 1, 64);

export default BirdsNestTable;
