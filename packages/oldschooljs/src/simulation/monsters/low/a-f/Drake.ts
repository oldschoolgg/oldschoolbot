import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';
import { GemTable } from '../../../subtables/RareDropTable';
import RareSeedTable from '../../../subtables/RareSeedTable';

const DrakeNotedHerbTable = new LootTable()
	.add('Grimy avantoe', [1, 3], 10)
	.add('Grimy kwuarm', [1, 3], 10)
	.add('Grimy ranarr weed', [1, 3], 8)
	.add('Grimy snapdragon', [1, 3], 8)
	.add('Grimy cadantine', [1, 3], 8)
	.add('Grimy dwarf weed', [1, 3], 8)
	.add('Grimy lantadyme', [1, 3], 6)
	.add('Grimy torstol', [1, 3], 6);

const DrakeOnTaskUniqueTable = new LootTable()
	/* Pre-roll */
	.oneIn(2000, 'Dragon thrownaxe', [100, 200])
	.oneIn(2000, 'Dragon knife', [100, 200])
	.oneIn(512, "Drake's tooth")
	.oneIn(512, "Drake's claw");

const DrakeOffTaskUniqueTable = new LootTable()
	/* Pre-roll */
	.oneIn(10_000, 'Dragon thrownaxe', [100, 200])
	.oneIn(10_000, 'Dragon knife', [100, 200])
	.oneIn(2560, "Drake's tooth")
	.oneIn(2560, "Drake's claw");

export const DrakePreTable = new LootTable()
	/* Weapons and armour */
	.add('Rune full helm', 1, 3)
	.add("Red d'hide body", 1, 2)
	.add("Black d'hide vambraces", 1, 1)
	.add('Mystic earth staff', 1, 1)
	.add('Dragon mace', 1, 1)

	/* Runes and ammunition */
	.add('Fire rune', [100, 200], 10)
	.add('Nature rune', [30, 60], 10)
	.add('Law rune', [25, 50], 10)
	.add('Death rune', [20, 40], 10)
	.add('Rune arrow', [35, 65], 10)

	/* Herbs */
	.add(HerbDropTable, [1, 3], 5)
	.add(DrakeNotedHerbTable, 1, 6)

	/* Seeds */
	.add(RareSeedTable, 1, 1)

	/* Other */
	.add('Coins', [1000, 2000], 4)
	.add('Coins', [5000, 7000], 1)
	.add('Diamond', [3, 6], 4)
	.add('Swordfish', [1, 2], 4)

	/* Rdt */
	.add(GemTable, 1, 1);

const DrakeTable = new LootTable()
	.every('Drake bones')
	.every(DrakePreTable)
	.every(DrakeOffTaskUniqueTable)

	/* Tertiary */
	.tertiary(128, 'Clue scroll (hard)');

const DrakeOnTaskTable = new LootTable()
	.every('Drake bones')
	.every(DrakePreTable)
	.every(DrakeOnTaskUniqueTable)

	/* Tertiary */
	.tertiary(128, 'Clue scroll (hard)');

export default new SimpleMonster({
	id: 8612,
	name: 'Drake',
	table: DrakeTable,
	onTaskTable: DrakeOnTaskTable,
	aliases: ['drake', 'fire hippos']
});
