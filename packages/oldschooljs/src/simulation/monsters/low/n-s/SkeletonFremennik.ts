import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import { GemTable } from '../../../subtables/RareDropTable';
import { UncommonSeedDropTable } from '../../../subtables/index';

export const SkeletonFremennikTable = new LootTable()
	.every('Bones')
	.tertiary(5000, 'Skeleton champion scroll')

	/* Weapons and armour */
	.add('Steel med helm', 1, 6)
	.add('Steel sword', 1, 4)
	.add('Black axe', 1, 2)
	.add('Mithril scimitar', 1, 1)

	/* Runes and ammunition */
	.add('Air rune', 60, 3)
	.add('Chaos rune', 9, 3)
	.add('Water rune', 20, 3)
	.add('Law rune', 2, 2)
	.add('Mithril arrow', 8, 2)
	.add('Cosmic rune', 4, 1)

	/* Seeds */
	.add(UncommonSeedDropTable, 1, 20)

	/* Coins */
	.add('Coins', 80, 23)
	.add('Coins', 20, 22)
	.add('Coins', 50, 8)
	.add('Coins', 90, 4)
	.add('Coins', 185, 3)
	.add('Coins', 200, 2)

	/* Other */
	.add('Mithril bar', 1, 5)

	/* Gem drop table */
	.add(GemTable);

export default new SimpleMonster({
	id: 4498,
	name: 'Skeleton fremennik',
	table: SkeletonFremennikTable,
	aliases: ['skeleton fremennik']
});
