import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import RareDropTable, { GemTable } from '../../../subtables/RareDropTable';
import RareSeedTable from '../../../subtables/RareSeedTable';

export const NechryaelPreTable = new LootTable()
	/* Weapons and armor */
	.add('Adamant platelegs', 1, 8)
	.add('Rune 2h sword', 1, 8)
	.add('Rune full helm', 1, 6)
	.add('Adamant kiteshield', 1, 4)
	.add('Rune boots', 1, 1)

	/* Runes*/
	.add('Chaos rune', 37, 16)
	.add('Death rune', 5, 12)
	.add('Death rune', 10, 12)
	.add('Law rune', [25, 35], 10)
	.add('Blood rune', [15, 20], 8)

	/* Seeds */
	.add('Limpwurt seed', 1, 12)
	.add(RareSeedTable, 2, 36)

	/* Coins */
	.add('Coins', [1000, 1499], 26)
	.add('Coins', [1500, 2000], 21)
	.add('Coins', [2500, 2999], 12)
	.add('Coins', [3000, 3500], 6)
	.add('Coins', [500, 999], 5)
	.add('Coins', 5000, 2)

	/* Other */
	.add('Soft clay', 25, 8)
	.add('Tuna', 1, 6)

	/* RDT */
	.add(RareDropTable, 1, 2)
	.add(GemTable, 1, 10);

const NechryaelTable = new LootTable()
	.every('Malicious ashes')
	.every(NechryaelPreTable)

	/* Tertiary */
	.tertiary(128, 'Clue scroll (hard)');

export default new SimpleMonster({
	id: 8,
	name: 'Nechryael',
	table: NechryaelTable,
	aliases: ['nechryael', 'nech', 'nechs']
});
