import LootTable from '@/structures/LootTable.js';
import { BarbarianAssault } from './BarbarianAssault.js';
import { ChambersOfXeric } from './ChambersOfXeric.js';
import { FishingTrawler } from './FishingTrawler.js';
import { Gauntlet } from './Gauntlet.js';
import Nightmare from './Nightmare.js';
import { Tempoross } from './Tempoross.js';
import Zalcano from './Zalcano.js';

export const GrandHallowedCoffin = new LootTable()
	.every('Hallowed mark', [8, 10])
	.tertiary(200, 'Ring of endurance (uncharged)')
	.tertiary(30, 'Clue scroll (elite)')
	.add('Rune 2h sword')
	.add('Rune platebody')
	.add('Law rune', [150, 250])
	.add('Blood rune', [150, 250])
	.add('Soul rune', [150, 250])
	.add('Runite bolts', [100, 300])
	.add('Monkfish', [2, 6])
	.add('Sanfew serum(4)', [1, 2])
	.add('Ranarr seed', [1, 2])
	.add('Coins', [17_500, 25_000]);

export const AncientCavernAncientPageTable = new LootTable()
	.add(11_341, 1, 1)
	.add(11_342, 1, 1)
	.add(11_343, 1, 1)
	.add(11_344, 1, 1)
	.add(11_345, 1, 1)
	.add(11_346, 1, 1)
	.add(11_347, 1, 1)
	.add(11_348, 1, 1)
	.add(11_349, 1, 1)
	.add(11_350, 1, 1)
	.add(11_351, 1, 1)
	.add(11_352, 1, 1)
	.add(11_353, 1, 1)
	.add(11_354, 1, 1)
	.add(11_355, 1, 1)
	.add(11_356, 1, 1)
	.add(11_357, 1, 1)
	.add(11_358, 1, 1)
	.add(11_359, 1, 1)
	.add(11_360, 1, 1)
	.add(11_361, 1, 1)
	.add(11_362, 1, 1)
	.add(11_363, 1, 1)
	.add(11_364, 1, 1)
	.add(11_365, 1, 1)
	.add(11_366, 1, 1);

export { BarbarianAssault, ChambersOfXeric, FishingTrawler, Gauntlet, Nightmare, Tempoross, Zalcano };

export type { ChambersOfXericOptions } from './ChambersOfXeric.js';
export * from './Mimic.js';
export * from './TheatreOfBlood.js';
