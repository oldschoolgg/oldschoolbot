import LootTable from '../../../structures/LootTable';
import SimpleMonster from '../../../structures/SimpleMonster';
import { itemTupleToTable } from '../../../util';
import GWRareDropTable, { GWGemTable, ShardTable } from '../../subtables/GWRareDropTable';

const KreearraArmorTable = new LootTable().add('Armadyl helmet').add('Armadyl chestplate').add('Armadyl chainskirt');

const MinionUniqueTable = new LootTable().add('Coins', [1000, 1100], 124).add(KreearraArmorTable, 1, 3);

const MinionShardTable = new LootTable().add('Coins', [1000, 1100], 9).add(ShardTable, 1, 3);

const MinionTable = new LootTable()
	.every('Bones')
	.every('Feather', [1, 11])
	.add(MinionUniqueTable, 1, 1)
	.add(MinionShardTable, 1, 1)
	.add('Steel dart', [91, 101], 8)
	.add('Smoke rune', [10, 15], 8)
	.add('Manta ray', 2, 8)
	.add('Mushroom potato', 3, 8)
	.add('Steel arrow', [91, 101], 7)
	.add('Coins', [1000, 1100], 70)
	.add('Crushed nest', 2, 8)
	.add('Grimy kwuarm', 1, 8)
	.tertiary(128, 'Clue scroll (hard)');

const UniqueTable = new LootTable()
	.add(KreearraArmorTable, 1, 4)
	.add(ShardTable, 1, 2)
	.add('Armadyl hilt')
	.add('Coins', [20_500, 21_000], 5);

const KreearraTable = new LootTable()
	.every('Big bones')
	.every(MinionTable, 3)
	.every('Feather', [1, 16])
	.add(UniqueTable, 1, 3)
	.tertiary(250, 'Clue scroll (elite)')
	.tertiary(400, 'Long bone')
	.tertiary(5000, "Pet kree'arra")
	.tertiary(5013, 'Curved bone')

	/* Weapons and armour */
	.add("Black d'hide body", 1, 8)
	.add('Rune crossbow', 1, 8)

	/* Runes and ammunition */
	.add('Mind rune', [586, 601], 8)
	.add('Rune arrow', [100, 105], 8)
	.add('Runite bolts', [20, 25], 8)
	.add('Dragonstone bolts (e)', [5, 10], 8)

	/* Other */
	.add('Coins', [19_500, 20_000], 40)
	.add(
		itemTupleToTable([
			['Ranging potion(3)', 3],
			['Super defence(3)', 3]
		]),
		1,
		8
	)
	.add('Grimy dwarf weed', [8, 13], 8)
	.add('Dwarf weed seed', 3, 8)
	.add('Crystal key', 1, 1)
	.add('Yew seed', 1, 1)

	.add(GWRareDropTable, 1, 8)
	.add(GWGemTable, 1, 2);

export default new SimpleMonster({
	id: 3162,
	name: "Kree'arra",
	table: KreearraTable,
	aliases: ['arma', 'armadyl', 'kree', "kree'arra", 'bird person']
});
