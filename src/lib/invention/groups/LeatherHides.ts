import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

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
		{ item: i('Green dragon leather'), lvl: 57 },
		{ item: i('Blue dragonhide'), lvl: 66 },
		{ item: i('Blue dragon leather'), lvl: 66 },
		{ item: i('Green dragonhide'), lvl: 57 },
		{ item: i('Red dragonhide'), lvl: 73 },
		{ item: i('Red dragon leather'), lvl: 73 },
		{ item: i('Black dragon leather'), lvl: 79 },
		{ item: i('Black dragonhide'), lvl: 79 },
		{ item: i('Royal dragon leather'), lvl: 85 },
		{ item: i('Royal dragonhide'), lvl: 85 }
	],
	parts: { simple: 75, organic: 25 }
};
