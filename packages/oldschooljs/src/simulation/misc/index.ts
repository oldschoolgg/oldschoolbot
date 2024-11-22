import LootTable from '../../structures/LootTable';
import { BarbarianAssault } from './BarbarianAssault';
import { ChambersOfXeric } from './ChambersOfXeric';
import { FishingTrawler } from './FishingTrawler';
import { Gauntlet } from './Gauntlet';
import Nightmare from './Nightmare';
import { Tempoross } from './Tempoross';
import Zalcano from './Zalcano';

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

export { BarbarianAssault, ChambersOfXeric, FishingTrawler, Gauntlet, Nightmare, Tempoross, Zalcano };

export * from './Mimic';
export * from './TheatreOfBlood';
export type { ChambersOfXericOptions } from './ChambersOfXeric';
