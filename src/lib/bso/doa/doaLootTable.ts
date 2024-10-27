import { LootTable } from 'oldschooljs';

import { DragonTable } from '../../simulation/grandmasterClue';
import { StoneSpiritTable, runeAlchablesTable } from '../../simulation/sharedTables';

const DragonFletchingTable = new LootTable()
	.add('Dragon arrowtips', [10, 20])
	.add('Dragon dart tip', [10, 20])
	.add('Dragon javelin heads', [10, 20]);

const RareGemRockTable = new LootTable()
	.add('Uncut sapphire', 1, 9)
	.add('Uncut emerald', 1, 5)
	.add('Uncut ruby', 1, 5)
	.add('Uncut diamond', 1, 4);

const RareOreTable = new LootTable()
	.add('Mithril ore', [10, 70], 55)
	.add('Adamantite ore', [15, 50], 55)
	.add('Runite ore', [1, 20], 45)
	.add('Amethyst', [1, 15], 45);

const BaseNonUniqueTable = new LootTable()
	.add(RareGemRockTable, [80, 120], undefined, { multiply: true })
	.add(DragonFletchingTable, [15, 20], undefined, { multiply: true })
	.add(runeAlchablesTable, [25, 30], undefined, { multiply: true })
	.add(RareOreTable, [11, 15], undefined, { multiply: true })
	.add(DragonTable, [11, 18], undefined, { multiply: true })
	.add(StoneSpiritTable, [30, 60], undefined, { multiply: true });

const DOAClueTable = new LootTable()
	.add('Clue scroll (medium)', 1, 5)
	.add('Clue scroll (hard)', 1, 4)
	.add('Clue scroll (elite)', 1, 3)
	.add('Clue scroll (master)', 1, 2)
	.add('Clue scroll (grandmaster)', 1, 2);

export const DOANonUniqueTable = new LootTable()
	.tertiary(100, 'Oceanic dye')
	.oneIn(40, 'Shark tooth')
	.every(DOAClueTable, 2, { multiply: true })
	.every(BaseNonUniqueTable, 3, { multiply: true });
