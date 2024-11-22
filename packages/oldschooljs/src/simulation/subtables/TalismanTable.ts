import LootTable from '../../structures/LootTable';

const TalismanTable = new LootTable()
	.add('Air talisman', 1, 10)
	.add('Body talisman', 1, 10)
	.add('Earth talisman', 1, 10)
	.add('Fire talisman', 1, 10)
	.add('Mind talisman', 1, 10)
	.add('Water talisman', 1, 10)
	.add('Cosmic talisman', 1, 4)
	.add('Chaos talisman', 1, 3)
	.add('Nature talisman', 1, 3);

export default TalismanTable;
