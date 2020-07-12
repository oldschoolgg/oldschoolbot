import LootTable from 'oldschooljs/dist/structures/LootTable';

const SinisterChestTable = new LootTable()
	.every('Grimy ranarr weed', 3)
	.every('Grimy harralander', 2)
	.every('Grimy irit leaf')
	.every('Grimy avantoe')
	.every('Grimy kwuarm')
	.every('Grimy torstol');

export default SinisterChestTable;
