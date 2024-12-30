import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import { GemTable } from '../../../subtables';

const FeverSpiderTable = new LootTable({ limit: 36 })
	.add("Red d'hide chaps", 1, 3)
	.add('Adamant axe', 1, 2)
	.add('Adamant med helm', 1, 2)
	.add('Adamant battleaxe', 1, 1)
	.add('Grimy kwuarm', 6)
	.add('Coins', [200, 600], 8)
	.add('Bass', [1, 2], 7)
	.add('Limpwurt root', 1, 4)
	.add('pure essence', [100, 200], 2)
	.add(GemTable, 1, 1);

export default new SimpleMonster({
	id: 626,
	name: 'Fever spider',
	table: FeverSpiderTable,
	aliases: ['fever spider']
});
