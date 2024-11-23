import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import RareDropTable from '../../../subtables/RareDropTable';
import TreeHerbSeedTable from '../../../subtables/TreeHerbSeedTable';

const AncientWyvernTreeSeedTable = new LootTable().add('Mahogany seed', 1, 2).add('Magic seed', 1, 1);

const AncientWyvernTable = new LootTable()
	.every('Wyvern bones')
	.oneIn(600, 'Granite longsword')
	.oneIn(600, 'Granite boots')

	/* Weapons and armour */
	.add('Air battlestaff', 2, 16)
	.add('Battlestaff', 6, 8)
	.add('Mystic air staff', 1, 6)
	.add('Rune pickaxe', 1, 6)
	.add('Rune battleaxe', 1, 4)
	.add('Rune full helm', 1, 4)

	/* Runes and ammunition */
	.add('Nature rune', [37, 43], 8)
	.add('Death rune', [47, 53], 8)
	.add('Blood rune', [27, 33], 8)
	.add('Adamant arrow', [50, 76], 6)
	.add('Rune arrow', [25, 50], 6)
	.add('Runite bolts', [30, 60], 2)

	/* Herbs 27/128 */
	.add('Grimy torstol', 1, 8)
	.add('Grimy ranarr weed', 1, 8)
	.add('Grimy kwuarm', 3, 5)
	.add('Grimy cadantine', 3, 4)
	.add('Grimy dwarf weed', 3, 4)
	.add('Grimy lantadyme', 3, 3)

	/* Seeds */
	.add(TreeHerbSeedTable, 1, 4)
	.add('Seaweed spore', [16, 24], 2)
	.add('Ranarr seed', [2, 3], 1)
	.add('Yew seed', 1, 2)
	.add(AncientWyvernTreeSeedTable, 1, 2)

	/* Materials 41/128 */
	.add('Adamantite bar', 3, 12)
	.add('Volcanic ash', [80, 120], 12)
	.add('Adamantite ore', 20, 10)
	.add('Mahogany logs', [25, 30], 10)
	.add('Onyx bolt tips', [10, 15], 8)
	.add('Runite ore', [2, 3], 6)
	.add('Diamond', [3, 5], 6)

	/* Fossils */
	.tertiary(2, 'Numulite', [5, 95])
	.tertiary(29, 'Unidentified small fossil')
	.tertiary(58, 'Unidentified medium fossil')
	.tertiary(73, 'Unidentified large fossil')
	.tertiary(292, 'Unidentified rare fossil')

	/* Other 20/128 */
	.add('Shark', 5, 16)
	.add('Super restore(4)', 2, 16)
	.add('Coins', [2000, 6000], 14)
	.add('Super combat potion(2)', 1, 10)
	.add('Runite crossbow (u)', 1, 6)
	.add('Supercompost', [7, 10], 6)

	/* RDT */
	.add(RareDropTable, 1, 4)

	/* Tertiary */
	.tertiary(350, 'Clue scroll (elite)')
	.tertiary(10_000, 'Wyvern visage');

export default new SimpleMonster({
	id: 7795,
	name: 'Ancient Wyvern',
	table: AncientWyvernTable,
	aliases: ['ancient wyvern', 'ancient']
});
