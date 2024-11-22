import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import RareDropTable from '../../../subtables/RareDropTable';
import TreeHerbSeedTable from '../../../subtables/TreeHerbSeedTable';

const AncientZygomiteTable = new LootTable()
	.every('Mort myre fungus', [1, 2])

	/* Weapons */
	.add('Rune axe', 1, 2)

	/* Runes  */
	.add('Earth rune', 100, 10)
	.add('Law rune', 15, 4)
	.add('Cosmic rune', 15, 4)
	.add('Nature rune', 15, 4)

	/* Herbs */
	.add('Grimy kwuarm', [1, 2], 4)
	.add('Grimy torstol', 1, 4)
	.add('Grimy cadantine', [1, 2], 3)
	.add('Grimy dwarf weed', [1, 2], 2)
	.add('Grimy lantadyme', [1, 2], 2)

	/* Seeds */
	.add('Mushroom spore', 1, 8)
	.add(TreeHerbSeedTable, 1, 3)

	/* Fossils */
	.add('Numulite', [7, 19], 29)
	.add('Unidentified small fossil', 1, 2)
	.oneIn(100, 'Unidentified medium fossil')
	.oneIn(125, 'Unidentified large fossil')
	.oneIn(500, 'Unidentified rare fossil')

	/* Other */
	.add('Pyrophosphite', 1, 13)
	.add('Calcite', 1, 12)
	.add('Supercompost', 2, 8)
	.add('Volcanic ash', 2, 2)
	.add('Mort myre fungus', 5, 2)

	/* Gem drop table */
	.add(RareDropTable, 1, 4)

	/* Tertiary */
	.tertiary(128, 'Clue scroll (medium)');

export default new SimpleMonster({
	id: 7797,
	name: 'Ancient Zygomite',
	table: AncientZygomiteTable,
	aliases: ['ancient zygomite']
});
