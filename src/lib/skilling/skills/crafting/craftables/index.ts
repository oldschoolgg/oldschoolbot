import type { Craftable } from '../../../types';
import Birdhouse from './birdhouse';
import Built from './built';
import Dragonhide from './dragonhide';
import Gems from './gems';
import Glassblowing from './glassblowing';
import Gold from './gold';
import Leather from './leather';
import Misc from './misc';
import Silver from './silver';
import Tanning from './tanning';

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
	...Tanning
];
