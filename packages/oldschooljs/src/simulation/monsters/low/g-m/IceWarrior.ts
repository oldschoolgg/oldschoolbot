import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';
import { GemTable } from '../../../subtables/RareDropTable';
import { UncommonSeedDropTable } from '../../../subtables/index';

export const IceWarriorTable = new LootTable({ limit: 128 })
	/* Weapons */
	.add('Iron battleaxe', 1, 3)
	.add('Mithril mace', 1, 1)

	/* Runes and ammunition */
	.add('Nature rune', 4, 10)
	.add('Chaos rune', 3, 8)
	.add('Law rune', 2, 7)
	.add('Cosmic rune', 2, 5)
	.add('Mithril arrow', 3, 5)
	.add('Adamant arrow', 2, 2)
	.add('Death rune', 2, 3)
	.add('Blood rune', 2, 1)

	/* Herbs */
	.add(HerbDropTable, 1, 10)

	/* Seeds */
	.add(UncommonSeedDropTable, 1, 18)

	/* Coins */
	.add('Coins', 15, 39)

	/* Gem drop table */
	.add(GemTable, 1, 3)

	/* Tertiary */
	.tertiary(128, 'Clue scroll (medium)');

export default new SimpleMonster({
	id: 2841,
	name: 'Ice warrior',
	table: IceWarriorTable,
	aliases: ['ice warrior']
});
