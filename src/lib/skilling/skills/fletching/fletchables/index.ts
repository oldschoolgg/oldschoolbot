import { Fletchable } from '../../../types';
import Bows from './bows';
import Shafts from './shafts';
import Shields from './shields';
import Arrows from './arrows';
import Bolts from './bolts';
import Tips from './tips';
import TippedDragonBolts from './tippedDragonBolts';
import TippedBolts from './tippedBolts';
import Javelins from './javelins';
import Darts from './darts';
import Crossbows from './crossbows';

const fletchables: Fletchable[] = [
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
	...Crossbows
];

export default fletchables;
