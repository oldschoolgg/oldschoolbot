import LootTable from '../../structures/LootTable';

const VariableAllotmentSeedTable = new LootTable()
	.add('Potato seed', [1, 4], 64)
	.add('Onion seed', [1, 3], 32)
	.add('Cabbage seed', [1, 3], 16)
	.add('Tomato seed', [1, 2], 8)
	.add('Sweetcorn seed', [1, 2], 4)
	.add('Strawberry seed', 1, 2)
	.add('Watermelon seed', 1, 1)
	.add('Snape grass seed', 1, 1);

export default VariableAllotmentSeedTable;
