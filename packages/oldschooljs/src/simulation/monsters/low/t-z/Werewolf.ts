import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';
import { GemTable } from '../../../subtables/RareDropTable';

const WerewolfTable = new LootTable({ limit: 512 })
	.every('Wolf bones')

	/* Weapons and armour */
	.add('Steel scimitar', 1, 32)
	.add('Steel axe', 1, 25)
	.add('Steel full helm', 1, 15)
	.add('Mithril chainbody', 1, 10)
	.add('Mithril sq shield', 1, 10)
	.add('Rune med helm', 1, 3)

	/* Herbs */
	.add(HerbDropTable, 1, 3)

	/* Food */
	.add('Jug of wine', 1, 20)
	.add('Raw chicken', 5, 10)
	.add('Raw beef', 5, 10)
	.add('Raw bear meat', 5, 10)

	/* Coins */
	.add('Coins', 10, 80)
	.add('Coins', 90, 20)
	.add('Coins', 120, 20)
	.add('Coins', 222, 20)
	.add('Coins', 364, 20)

	/* Other */
	.add('Grey wolf fur', 1, 100)
	.add('Fur', 1, 100)

	/* Gem drop table */
	.add(GemTable, 1, 2)

	/* Tertiary */
	.tertiary(128, 'Clue scroll (easy)')
	.tertiary(512, 'Clue scroll (medium)');

export default new SimpleMonster({
	id: 2593,
	name: 'Werewolf',
	table: WerewolfTable,
	aliases: ['werewolf']
});
