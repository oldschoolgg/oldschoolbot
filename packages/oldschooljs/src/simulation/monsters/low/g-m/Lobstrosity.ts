import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';
import { NotedHerbTable } from '../../../subtables/NotedHerbTable';
import { GemTable } from '../../../subtables/RareDropTable';
import RareSeedTable from '../../../subtables/RareSeedTable';
import { UncommonSeedDropTable } from '../../../subtables/index';

export const LobstrosityTable = new LootTable()
	.every('Raw lobster')

	/* Runes */
	.add('Water rune', 100, 8)
	.add('Chaos rune', 20, 8)
	.add('Nature rune', 10, 6)
	.add('Death rune', 10, 5)

	/* Noted herbs */
	.add(NotedHerbTable, 2, 11)

	/* Un-noted herbs */
	.add(HerbDropTable, 2, 14)

	/* Seeds */
	.add(UncommonSeedDropTable, 2, 4)
	.add(RareSeedTable, 1, 5)
	.add('Seaweed spore', 5, 6)

	/* Other */
	.add('Coins', 1000, 9)
	.add('Pufferfish', 1, 8)
	.add('Giant seaweed', 6, 8)
	.add('Seaweed', 6, 8)
	.add("Toad's legs", 2, 6)
	.add('Caviar', 2, 5)
	.add('Oyster pearls', 1, 4)

	/* Gem drop table */
	.add(GemTable, 1, 3)

	/* Tertiary */
	.tertiary(4, 'Numulite', [5, 14])
	.tertiary(70, 'Unidentified small fossil')
	.tertiary(128, 'Clue scroll (easy)')
	.tertiary(140, 'Unidentified medium fossil')
	.tertiary(175, 'Unidentified large fossil')
	.tertiary(700, 'Unidentified rare fossil');

export default new SimpleMonster({
	id: 7796,
	name: 'Lobstrosity',
	table: LobstrosityTable,
	aliases: ['lobstrosity']
});
