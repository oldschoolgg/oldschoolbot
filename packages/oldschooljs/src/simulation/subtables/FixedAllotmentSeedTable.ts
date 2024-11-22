import LootTable from '../../structures/LootTable';

const FixedAllotmentSeedTable = new LootTable()
	.add('Potato seed', 4, 96)
	.add('Onion seed', 4, 72)
	.add('Cabbage seed', 4, 48)
	.add('Tomato seed', 3, 24)
	.add('Sweetcorn seed', 3, 12)
	.add('Strawberry seed', 2, 6)
	.add('Watermelon seed', 2, 3)
	.add('Snape grass seed', 2, 2);

export default FixedAllotmentSeedTable;
