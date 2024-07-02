import type { Fletchable } from '../../../types';
import Arrows from './arrows';
import Bolts from './bolts';
import Bows from './bows';
import Crossbows from './crossbows';
import Darts from './darts';
import Javelins from './javelins';
import Shafts from './shafts';
import Shields from './shields';
import Slayer from './slayer';
import TippedBolts from './tippedBolts';
import TippedDragonBolts from './tippedDragonBolts';
import Tips from './tips';

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
