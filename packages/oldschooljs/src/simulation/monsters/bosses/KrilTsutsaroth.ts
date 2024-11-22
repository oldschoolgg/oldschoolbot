import LootTable from '../../../structures/LootTable';
import SimpleMonster from '../../../structures/SimpleMonster';
import { itemTupleToTable } from '../../../util';
import GWRareDropTable, { GWGemTable, ShardTable } from '../../subtables/GWRareDropTable';

const MinionUniqueTable = new LootTable().add('Coins', [1300, 1400], 124).add('Zamorakian spear', 1, 3);

const MinionShardTable = new LootTable().add('Coins', [1300, 1400], 9).add(ShardTable, 1, 3);

const MinionTable = new LootTable()
	.every('Malicious ashes')
	.add(MinionUniqueTable, 1, 1)
	.add(MinionShardTable, 1, 1)
	.add('Steel dart', [95, 100], 8)
	.add('Death rune', [5, 10], 8)
	.add('Blood rune', [5, 10], 8)
	.add('Steel arrow', [95, 100], 7)
	.add('Coins', [1300, 1400], 66)
	.add('Shark', 3, 8)
	.add('Tuna potato', 2, 8)
	.add('Wine of zamorak', [5, 10], 8)
	.add('Super attack(3)', 1, 2)
	.add('Super strength(3)', 1, 2)
	.tertiary(128, 'Clue scroll (hard)');

const ZaklnGritchMinionTable = new LootTable({ limit: 5000 })
	.every(MinionTable)
	.add('Lesser demon champion scroll', 1, 1);

const UniqueTable = new LootTable()
	.add('Steam battlestaff', 1, 4)
	.add('Zamorakian spear', 1, 4)
	.add('Staff of the dead')
	.add('Zamorak hilt')
	.add(ShardTable, 1, 2);

const KrilTsutsarothTable = new LootTable()
	.every('Infernal ashes')
	.every(MinionTable, 2)
	.every(ZaklnGritchMinionTable)
	.add(UniqueTable, 1, 3)
	.tertiary(250, 'Clue scroll (elite)')
	.tertiary(5000, "Pet k'ril tsutsaroth")

	/* Weapons and armour */
	.add('Adamant arrow(p++)', [295, 300], 8)
	.add('Rune scimitar', 1, 8)
	.add('Adamant platebody', 1, 8)
	.add('Rune platelegs', 1, 7)
	.add('Dragon dagger(p++)', 1, 2)

	/* Potions */
	.add(
		itemTupleToTable([
			['Super attack(3)', 3],
			['Super strength(3)', 3]
		]),
		1,
		8
	)
	.add(
		itemTupleToTable([
			['Super restore(3)', 3],
			['Zamorak brew(3)', 3]
		]),
		1,
		8
	)

	/* Other */
	.add('Coins', [19_500, 20_000], 33)
	.add('Grimy lantadyme', 10, 8)
	.add('Lantadyme seed', 3, 8)
	.add('Death rune', [120, 125], 8)
	.add('Blood rune', [80, 85], 8)

	.add(GWRareDropTable, 1, 8)
	.add(GWGemTable, 1, 2);

export default new SimpleMonster({
	id: 3129,
	name: "K'ril Tsutsaroth",
	table: KrilTsutsarothTable,
	aliases: ['kril', 'zammy', 'zamorak', "k'ril tsutsaroth"]
});
