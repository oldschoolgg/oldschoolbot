import LootTable from '../../../structures/LootTable';
import SimpleMonster from '../../../structures/SimpleMonster';
import { itemTupleToTable } from '../../../util';
import GWRareDropTable, { GWGemTable, ShardTable } from '../../subtables/GWRareDropTable';

const MinionUniqueTable = new LootTable().add('Coins', [1400, 1500], 124).add('Saradomin sword', 1, 3);

const MinionShardTable = new LootTable().add('Coins', [1300, 1400], 9).add(ShardTable, 1, 3);

const MinionTable = new LootTable()
	.every('Bones')
	.add(MinionUniqueTable, 1, 1)
	.add(MinionShardTable, 1, 1)
	.add('Steel arrow', [95, 100], 8)
	.add('Steel dart', [95, 100], 8)
	.add('Law rune', [5, 10], 8)
	.add('Monkfish', 3, 8)
	.add('Summer pie', 1, 8)
	.add('Coins', [1300, 1400], 62)
	.add('Grimy ranarr weed', 1, 8)
	.add('Unicorn horn', 6, 8)
	.add('Snape grass', 5, 7)
	.tertiary(128, 'Clue scroll (hard)');

const UniqueTable = new LootTable()
	.add('Saradomin sword', 1, 4)
	.add("Saradomin's light", 1, 2)
	.add('Armadyl crossbow')
	.add('Saradomin hilt')
	.add(ShardTable, 1, 2)
	.add('Coins', [19_500, 20_000], 2);

const CommanderZilyanaTable = new LootTable()
	.every('Bones')
	.every(MinionTable, 3)
	.add(UniqueTable, 1, 3)
	.tertiary(250, 'Clue scroll (elite)')
	.tertiary(5000, 'Pet zilyana')

	/* Weapons and armour */
	.add('Adamant platebody', 1, 8)
	.add('Rune dart', [35, 40], 8)
	.add('Rune kiteshield', 1, 8)
	.add('Rune plateskirt', 1, 8)

	/* Potions */
	.add('Prayer potion(4)', 3, 8)
	.add(
		itemTupleToTable([
			['Super defence(3)', 3],
			['Magic potion(3)', 3]
		]),
		1,
		8
	)
	.add(
		itemTupleToTable([
			['Saradomin brew(3)', 3],
			['Super restore(4)', 3]
		]),
		1,
		6
	)

	/* Other */
	.add('Coins', [19_500, 20_000], 27)
	.add('Diamond', 6, 8)
	.add('Law rune', [95, 100], 8)
	.add('Grimy ranarr weed', 5, 8)
	.add('Ranarr seed', 2, 8)
	.add('Magic seed', 1, 1)

	.add(GWRareDropTable, 1, 8)
	.add(GWGemTable, 1, 2);

export default new SimpleMonster({
	id: 2205,
	name: 'Commander Zilyana',
	table: CommanderZilyanaTable,
	aliases: ['sara', 'zily', 'saradomin', 'zilyana', 'commander zilyana']
});
