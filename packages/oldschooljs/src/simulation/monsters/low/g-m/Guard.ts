import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import FixedAllotmentSeedTable from '../../../subtables/FixedAllotmentSeedTable';

const GuardTable = new LootTable({ limit: 128 })
	.every('Bones')
	.tertiary(106, 'Clue scroll (medium)')

	/* Runes and ammunition */
	.add('Iron bolts', [2, 12], 10)
	.add('Steel arrow', 1, 4)
	.add('Bronze arrow', 1, 3)
	.add('Air rune', 6, 2)
	.add('Earth rune', 3, 2)
	.add('Fire rune', 2, 2)
	.add('Blood rune', 1, 1)
	.add('Chaos rune', 1, 1)
	.add('Nature rune', 1, 1)
	.add('Steel arrow', 5, 1)

	/* Coins */
	.add('Coins', 1, 19)
	.add('Coins', 7, 16)
	.add('Coins', 12, 9)
	.add('Coins', 4, 8)
	.add('Coins', 25, 4)
	.add('Coins', 17, 4)
	.add('Coins', 30, 2)

	/* Other */
	.add(FixedAllotmentSeedTable, 1, 18)
	.add('Iron dagger', 1, 6)
	.add('Body talisman', 1, 4)
	.add('Grain', 1, 1)
	.add('Iron ore', 1, 1);

export default new SimpleMonster({
	id: 995,
	name: 'Guard',
	table: GuardTable,
	pickpocketTable: new LootTable().add('Coins', 30).tertiary(257_211, 'Rocky'),
	aliases: ['guard']
});
