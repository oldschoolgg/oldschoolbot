import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import { GemTable } from '../../../subtables/RareDropTable';

export const IcefiendTable = new LootTable({ limit: 128 })
	.tertiary(128, 'Clue scroll (easy)')

	/* Runes */
	.add('Water rune', [1, 5], 4)
	.add('Air rune', [1, 5], 1)

	/* Other */
	.add('Coins', [1, 30], 4)
	.add('Coins', [1, 20], 4)

	/* Subtable */
	.add(GemTable, 1, 3);

export default new SimpleMonster({
	id: 3140,
	name: 'Icefiend',
	table: IcefiendTable,
	aliases: ['icefiend']
});
