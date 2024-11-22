import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';
import { GemTable } from '../../../subtables/RareDropTable';
import RareSeedTable from '../../../subtables/RareSeedTable';

const AberrantSpectreHerbTable = new LootTable()
	.add(HerbDropTable, 1, 11)
	.add(HerbDropTable, 2, 11)
	.add(HerbDropTable, 3, 4);

export const AberrantSpectrePreTable = new LootTable({ limit: 128 })
	/* Weapons and armour */
	.add('Steel axe', 1, 3)
	.add('Mithril kiteshield', 1, 1)
	.add('Lava battlestaff', 1, 1)
	.add('Adamant platelegs', 1, 1)
	.add('Rune full helm', 1, 1)
	.oneIn(512, 'Mystic robe bottom (dark)')

	/* Herbs */
	.add(AberrantSpectreHerbTable, 1, 78)

	/* Seeds */
	.add(RareSeedTable, 1, 19)

	/* Coins */
	.add('Coins', 460, 1)

	/* Rdt */
	.add(GemTable, 1, 5);

const AberrantSpectreTable = new LootTable()
	.every(AberrantSpectrePreTable)

	/* Tertiary */
	.tertiary(128, 'Clue scroll (hard)');

export default new SimpleMonster({
	id: 2,
	name: 'Aberrant Spectre',
	table: AberrantSpectreTable,
	aliases: ['aberrant', 'aberrant spectre', 'abby specs']
});
