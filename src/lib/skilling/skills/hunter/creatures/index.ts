import { bsoCreatures } from '@/lib/bso/skills/hunter/bsoCreatures.js';

import type { Creature } from '@/lib/skilling/types.js';
import birdSnaringCreatures from './birdSnaring.js';
import boxTrappingCreatures from './boxTrapping.js';
import butterflyNettingCreatures from './butterflyNetting.js';
import deadfallTrappingCreatures from './deadfallTrapping.js';
import falconryCreatures from './falconry.js';
import magicBoxTrappingCreatures from './magicBoxTrapping.js';
import netTrappingCreatures from './netTrapping.js';
import pitfallTrappingCreatures from './pitfallTrapping.js';
import rabbitSnaringCreatures from './rabbitSnaring.js';
import trackingCreatures from './tracking.js';

const creatures: Creature[] = [
	...birdSnaringCreatures,
	...boxTrappingCreatures,
	...butterflyNettingCreatures,
	...deadfallTrappingCreatures,
	...falconryCreatures,
	...magicBoxTrappingCreatures,
	...netTrappingCreatures,
	...pitfallTrappingCreatures,
	...rabbitSnaringCreatures,
	...trackingCreatures,
	...bsoCreatures
];

export default creatures;
