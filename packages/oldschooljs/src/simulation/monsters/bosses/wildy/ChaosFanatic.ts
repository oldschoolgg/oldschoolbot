import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import { itemTupleToTable } from '../../../../util';
import RareDropTable, { GemTable } from '../../../subtables/RareDropTable';

const ChaosFanaticUniqueTable = new LootTable().add('Odium shard 1').add('Malediction shard 1');

const ChaosFanaticTable = new LootTable()
	.every('Bones')
	.tertiary(128, 'Clue scroll (hard)')
	.tertiary(1000, 'Pet chaos elemental')
	.add(ChaosFanaticUniqueTable, 1, 1)

	/* Weapons and armour */
	.add('Battlestaff', 5, 5)
	.add('Splitbark body', 1, 5)
	.add('Splitbark legs', 1, 5)
	.add(
		itemTupleToTable([
			['Zamorak monk top', 1],
			['Zamorak monk bottom', 1]
		]),
		1,
		4
	)
	.add('Ancient staff', 1, 1)

	/* Runes */
	.add('Fire rune', 250, 4)
	.add('Smoke rune', 30, 4)
	.add('Chaos rune', 175, 4)
	.add('Blood rune', 50, 4)

	/* Consumables */
	.add('Monkfish', 3, 8)
	.add('Shark', 1, 8)
	.add('Prayer potion(4)', 1, 8)
	.add('Anchovy pizza', 8, 4)

	/* Other */
	.add('Coins', [499, 3998], 18)
	.add('Grimy lantadyme', 4, 8)
	.add('Ring of life', 1, 7)
	.add('Chaos talisman', 1, 6)
	.add('Wine of zamorak', 10, 6)
	.add(
		itemTupleToTable([
			['Uncut emerald', 6],
			['Uncut sapphire', 4]
		]),
		1,
		5
	)
	.add('Sinister key', 1, 4)
	.add('Pure essence', 250, 2)

	/* Subtables */
	.add(RareDropTable, 1, 4)
	.add(GemTable, 1, 4);

export default new SimpleMonster({
	id: 6619,
	name: 'Chaos Fanatic',
	table: ChaosFanaticTable,
	aliases: ['chaos fanatic', 'fanatic']
});
