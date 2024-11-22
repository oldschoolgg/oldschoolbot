import LootTable from '../../structures/LootTable';
import SimpleOpenable from '../../structures/SimpleOpenable';

const LowTierLootTable = new LootTable()
	.add("Monk's robe top")
	.add("Monk's robe")
	.add('Holy symbol')
	.add('Air rune', [500, 750])
	.add('Fire rune', [500, 750])
	.add('Chaos rune', [25, 50])
	.add('Mithril bolts', [50, 150])
	.add('Prayer potion(2)')
	.add('White lily')
	.add('Coins', [1500, 3000]);

const MidTierLootTable = new LootTable()
	.add('Adamant 2h sword')
	.add('Adamant platebody')
	.add('Cosmic rune', [60, 100])
	.add('Death rune', [60, 100])
	.add('Nature rune', [60, 100])
	.add('Adamant bolts', [50, 200])
	.add('Monkfish', [1, 3])
	.add('Prayer potion(4)')
	.add('Grimy ranarr weed', [1, 2])
	.add('Coins', [7500, 12_500]);

const HighTierLootTable = new LootTable()
	.add('Rune 2h sword')
	.add('Rune platebody')
	.add('Law rune', [150, 250])
	.add('Blood rune', [150, 250])
	.add('Soul rune', [150, 250])
	.add('Runite bolts', [100, 300])
	.add('Monkfish', [2, 6])
	.add('Sanfew serum(4)', [1, 2])
	.add('Ranarr seed', [1, 2])
	.add('Coins', [17_500, 25_000]);

export const HallowedSackTable = new LootTable()
	.every(LowTierLootTable, 5)
	.every(MidTierLootTable)
	.every(HighTierLootTable, 2);

export default new SimpleOpenable({
	id: 24_946,
	name: 'Hallowed Sack',
	aliases: ['hallow sack', 'hallowed sack'],
	table: HallowedSackTable
});
