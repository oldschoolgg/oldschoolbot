import { Items } from 'oldschooljs';

import type { Fletchable } from '@/lib/skilling/types.js';
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

const zeroTimeFletchableCandidates: Fletchable[] = [
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

export const zeroTimeFletchables: Fletchable[] = zeroTimeFletchableCandidates.filter(fletchable => {
	const outputItem = Items.getOrThrow(fletchable.id);
	if (!outputItem.stackable) {
		return false;
	}

	for (const [item] of fletchable.inputItems.items()) {
		if (!item.stackable) {
			return false;
		}
	}

	return true;
});
