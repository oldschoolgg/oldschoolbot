import { Items } from 'oldschooljs';

import type { Fletchable } from '../../../types';
import Arrows from './arrows';
import Bolts from './bolts';
import Bows from './bows';
import Crossbows from './crossbows';
import Darts from './darts';
import Javelins from './javelins';
import Shafts from './shafts';
import Shields from './shields';
import { AmethystBroadBolts, BroadArrows, BroadBolts, Slayer } from './slayer';
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
