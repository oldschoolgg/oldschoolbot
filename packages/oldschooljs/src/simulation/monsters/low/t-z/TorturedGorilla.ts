import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import RareDropTable from '../../../subtables/RareDropTable';
import TreeHerbSeedTable from '../../../subtables/TreeHerbSeedTable';

const UniqueTable = new LootTable()
	.add('Zenyte shard', 1, 5)
	.add('Ballista limbs', 1, 3)
	.add('Ballista spring', 1, 3)
	.add('Light frame', 1, 2)
	.add('Heavy frame', 1, 1)
	.add('Monkey tail', 1, 1);

const TorturedGorillaTable = new LootTable()
	.every('Big bones')
	.oneIn(1000, UniqueTable)

	// Todo: Check in future for updated loot chances.
	/* Weapons and armor */
	.add('Rune med helm', 1, 8)
	.add('Rune scimitar', 1, 8)

	/* Runes and ammunition */
	.add('Adamant bolts', 1, 36)
	.add('Earth rune', [418, 599], 10)
	.add('Law rune', [50, 75], 35)
	.add('Death rune', [50, 75], 35)

	/* Herbs */
	.add('Grimy cadantine', 1, 8)
	.add('Grimy kwuarm', 1, 8)
	.add('Grimy dwarf weed', 1, 8)

	/* Seeds */
	.add(TreeHerbSeedTable, 1, 25)

	/* Materials */
	.add('Javelin shaft', [100, 299], 10)
	.add('Adamantite bar', [1, 2], 5)
	.add('Ruby', [2, 3], 5)
	.add('Rune javelin heads', [45, 55], 5)
	.add('Dragon javelin heads', [27, 33], 5)

	/* Other */
	.add('Coins', [1171, 1969], 30)
	.add('Shark', 1, 5)
	.add('Prayer potion(1)', 1, 5)

	/* RDT */
	.add(RareDropTable, 1, 5)

	/* Tertiary */
	.tertiary(300, 'Clue scroll (hard)')
	.tertiary(400, 'Long bone')
	.tertiary(1500, 'Clue scroll (elite)')
	.tertiary(5013, 'Curved bone');

export default new SimpleMonster({
	id: 7097,
	name: 'Tortured Gorilla',
	table: TorturedGorillaTable,
	aliases: ['tortured gorilla']
});
