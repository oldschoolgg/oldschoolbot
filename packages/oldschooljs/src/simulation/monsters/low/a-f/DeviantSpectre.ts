import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';
import { GemTable } from '../../../subtables/RareDropTable';
import RareSeedTable from '../../../subtables/RareSeedTable';

const DeviantSpectreHerbTable = new LootTable().add(HerbDropTable, 2, 29).add(HerbDropTable, 3, 17);

export const DeviantSpectrePreTable = new LootTable()
	/* Weapons and armour */
	.add('Battlestaff', 1, 5)
	.add('Black platelegs', 1, 5)
	.add('Mithril battleaxe', 1, 5)
	.add('Rune full helm', 1, 2)
	.add('Lava battlestaff', 1, 1)
	.add('Rune chainbody', 1, 1)

	/* Herbs */
	.add(DeviantSpectreHerbTable, 1, 46)

	/* Seeds */
	.add('Limpwurt seed', [3, 11], 10)
	.add(RareSeedTable, 1, 16)

	/* Other */
	.add('Adamantite ore', 1, 5)

	/* Gem drop table */
	.add(GemTable, 1, 32);

const DeviantSpectreTable = new LootTable()
	.every(DeviantSpectrePreTable)

	/* Tertiary */
	.tertiary(128, 'Clue scroll (hard)')
	.tertiary(512, 'Mystic robe bottom (dark)');

export default new SimpleMonster({
	id: 7279,
	name: 'Deviant Spectre',
	table: DeviantSpectreTable,
	aliases: ['deviant', 'deviant spectre']
});
