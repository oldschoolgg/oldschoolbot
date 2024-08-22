import type { DisassemblySourceGroup } from '..';
import getOSItem from '../../util/getOSItem';

const i = getOSItem;

export const LeatherHides: DisassemblySourceGroup = {
	name: 'Leather and Hides',
	items: [
		{ item: i('Cowhide'), lvl: 1 },
		{ item: i('Leather'), lvl: 1 },
		{ item: i('Hard leather'), lvl: 25 },
		{ item: i('Cured yak-hide'), lvl: 43 },
		{ item: i('Yak-hide'), lvl: 43 },
		{ item: i('Snakeskin'), lvl: 45 },
		{ item: i('Snake hide'), lvl: 45 },
		{ item: i('Dagannoth hide'), lvl: 55 },
		{ item: i('Blue dragonhide'), lvl: 71 },
		{ item: i('Blue dragon leather'), lvl: 71 },
		{ item: i('Green dragonhide'), lvl: 62 },
		{ item: i('Green dragon leather'), lvl: 62 },
		{ item: i('Red dragonhide'), lvl: 78 },
		{ item: i('Red dragon leather'), lvl: 78 },
		{ item: i('Black dragon leather'), lvl: 84 },
		{ item: i('Black dragonhide'), lvl: 84 },
		{ item: i('Royal dragon leather'), lvl: 90 },
		{ item: i('Royal dragonhide'), lvl: 90 }
	],
	parts: { protective: 20, strong: 20, organic: 40 }
};
