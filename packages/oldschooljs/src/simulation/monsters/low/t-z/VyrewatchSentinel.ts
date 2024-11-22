import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';
import RareDropTable from '../../../subtables/RareDropTable';
import { UncommonSeedDropTable } from '../../../subtables/index';

export const VyrewatchSentinelTable = new LootTable()
	.every('Vampyre dust')

	/* Unique */
	.oneIn(1500, 'Blood shard')

	/* Weapons and armour */
	.add('Rune dagger', 1, 6)
	.add('Adamant platelegs', 1, 6)
	.add('Adamant platebody', 1, 4)
	.add('Rune full helm', 1, 1)
	.add('Rune kiteshield', 1, 1)

	/* Runes and ammunition */
	.add('Death rune', [6, 10], 10)
	.add('Blood rune', [8, 16], 10)
	.add('Nature rune', [6, 11], 10)
	.add('Rune arrow', [4, 10], 4)
	.add('Rune javelin', [5, 15], 2)

	/* Herbs */
	.add(HerbDropTable, 1, 1)

	/* Seeds */
	.add(UncommonSeedDropTable, 1, 1)

	/* Bolt tips */
	.oneIn(589, 'Opal bolt tips', [6, 14])
	.oneIn(589, 'Pearl bolt tips', [6, 14])
	.oneIn(589, 'Diamond bolt tips', [6, 14])
	.oneIn(883, 'Emerald bolt tips', [6, 14])
	.oneIn(883, 'Ruby bolt tips', [6, 14])
	.oneIn(884, 'Dragonstone bolt tips', [6, 14])
	.oneIn(1767, 'Jade bolt tips', [6, 14])
	.oneIn(1767, 'Topaz bolt tips', [6, 14])
	.oneIn(1767, 'Sapphire bolt tips', [6, 14])
	.oneIn(1767, 'Onyx bolt tips', [6, 14])

	/* Materials */
	.add('Bark', [4, 8], 4)
	.add('Coal', 8, 4)
	.add('Runite bar', 1, 2)
	.add('Yew logs', 6, 2)
	.add('Runite ore', 1, 2)

	/* Coins */
	.add('Coins', [100, 1000], 21)

	/* Rare drop table */
	.add(RareDropTable, 1, 1)

	/* Tertiary */
	.tertiary(128, 'Clue scroll (hard)');

export default new SimpleMonster({
	id: 9756,
	name: 'Vyrewatch Sentinel',
	table: VyrewatchSentinelTable,
	aliases: ['vyrewatch sentinel', 'bat people', 'bat person']
});
