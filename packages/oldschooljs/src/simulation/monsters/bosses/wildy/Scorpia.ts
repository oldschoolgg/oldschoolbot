import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

const ScorpiaUniqueTable = new LootTable().add('Odium shard 3').add('Malediction shard 3');

const ScorpiaTable = new LootTable()
	.tertiary(18, 'Ensouled scorpion head')
	.tertiary(100, 'Clue scroll (hard)')
	.tertiary(2016, "Scorpia's offspring")
	.add(ScorpiaUniqueTable, 1, 1)

	/* Weapons and armour */
	.add('Battlestaff', [5, 8], 6)
	.add('Rune 2h sword', 1, 5)
	.add('Rune pickaxe', 1, 5)
	.add('Rune kiteshield', 1, 5)
	.add('Rune chainbody', 1, 4)
	.add('Rune platelegs', 1, 4)
	.add('Rune scimitar', 1, 4)
	.add('Rune warhammer', 1, 4)
	.add('Mystic earth staff', 1, 4)
	.add('Mystic robe top', 1, 1)
	.add('Mystic robe bottom', 1, 1)
	.add('Dragon scimitar', 1, 1)
	.add('Dragon 2h sword', 1, 1)

	/* Runes */
	.add('Death rune', [100, 150], 8)
	.add('Blood rune', [100, 150], 8)
	.add('Chaos rune', [150, 200], 8)

	/* Herbs */
	.add('Grimy kwuarm', [10, 15], 5)
	.add('Grimy dwarf weed', [10, 15], 5)
	.add('Grimy torstol', [10, 15], 5)
	.add('Grimy snapdragon', [4, 7], 5)

	/* Materials */
	.add('Uncut ruby', [15, 20], 6)
	.add('Uncut diamond', [10, 15], 4)
	.add('Runite ore', 3, 4)
	.add('Dragon javelin heads', [30, 50], 4)
	.add('Onyx bolt tips', [6, 10], 2)

	/* Other */
	.add('Coins', [25_002, 34_962], 7)
	.add('Blighted anglerfish', [15, 25], 5)
	.add('Blighted super restore(4)', 5, 5)
	.add('Wilderness crabs teleport', 2, 2);

export default new SimpleMonster({
	id: 6615,
	name: 'Scorpia',
	table: ScorpiaTable,
	aliases: ['scorpia']
});
