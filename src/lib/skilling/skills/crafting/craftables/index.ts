import type { Craftable } from '@/lib/skilling/types.js';
import Birdhouse from './birdhouse.js';
import Built from './built.js';
import { customCraftables } from './custom.js';
import Dragonhide from './dragonhide.js';
import Gems from './gems.js';
import Glassblowing from './glassblowing.js';
import Gold from './gold.js';
import Leather from './leather.js';
import Misc from './misc.js';
import Silver from './silver.js';
import Tanning from './tanning.js';

export const Craftables: Craftable[] = [
	...Birdhouse,
	...Built,
	...Dragonhide,
	...Gems,
	...Glassblowing,
	...Gold,
	...Leather,
	...Misc,
	...Silver,
	...Tanning,
	...customCraftables
];

export const craftingCL = Craftables.map(i => i.id);
