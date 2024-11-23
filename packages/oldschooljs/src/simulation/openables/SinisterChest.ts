import LootTable from '../../structures/LootTable';
import SimpleOpenable from '../../structures/SimpleOpenable';

const SinisterChestTable = new LootTable()
	.every('Grimy ranarr weed', 3)
	.every('Grimy harralander', 2)
	.every('Grimy irit leaf')
	.every('Grimy avantoe')
	.every('Grimy kwuarm')
	.every('Grimy torstol');

export default new SimpleOpenable({
	id: 993,
	name: 'Sinister chest',
	aliases: ['sinister chest', 'sinister'],
	table: SinisterChestTable
});
