import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

const ElfTable = new LootTable({ limit: 128 })
	.add('Coins', [280, 350], 105)
	.add('Death rune', [1, 2], 8)
	.add('Jug of wine', 1, 6)
	.add('Nature rune', [1, 3], 5)
	.add('Fire orb', 1, 2)
	.add('Diamond', 1, 1)
	.add('Gold ore', 1, 1)
	.tertiary(99_175, 'Rocky');

export default new SimpleMonster({
	id: 5299,
	name: 'Elf',
	pickpocketTable: ElfTable,
	aliases: ['elf']
});
