import type { Fletchable } from '../../../types.js';
import Arrows from './arrows.js';
import Bolts from './bolts.js';
import Bows from './bows.js';
import Crossbows from './crossbows.js';
import Darts from './darts.js';
import Javelins from './javelins.js';
import Shafts from './shafts.js';
import Shields from './shields.js';
import { AmethystBroadBolts, BroadArrows, BroadBolts, Slayer } from './slayer.js';
import TippedBolts from './tippedBolts.js';
import TippedDragonBolts from './tippedDragonBolts.js';
import Tips from './tips.js';

export const Fletchables: Fletchable[] = [
	...Bows,
	...Shafts,
	...Shields,
	...Arrows,
	...Bolts,
	...Tips,
	...TippedDragonBolts,
	...TippedBolts,
	...Javelins,
	...Darts,
	...Crossbows,
	...Slayer
];

export const zeroTimeFletchables: Fletchable[] = [
	BroadArrows,
	BroadBolts,
	...Darts,
	...Arrows,
	...Bolts,
	AmethystBroadBolts,
	...TippedBolts,
	...TippedDragonBolts,
	...Javelins
];
