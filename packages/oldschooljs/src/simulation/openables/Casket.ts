import LootTable from '../../structures/LootTable';
import SimpleOpenable from '../../structures/SimpleOpenable';

const CasketTable = new LootTable()
	.add('Coins', 160, 24)
	.add('Coins', 20, 22)
	.add('Coins', 40, 20)
	.add('Coins', 320, 19)
	.add('Coins', 80, 18)
	.add('Coins', 640, 18)
	.add('Uncut sapphire', 1, 64)
	.add('Uncut emerald', 1, 33)
	.add('Uncut ruby', 1, 15)
	.add('Uncut diamond', 1, 4)
	.add('Cosmic talisman', 1, 16)
	.add('Loop half of key', 1, 2)
	.add('Tooth half of key', 1, 2);

export default new SimpleOpenable({
	id: 405,
	name: 'Casket',
	aliases: ['casket'],
	table: CasketTable
});
