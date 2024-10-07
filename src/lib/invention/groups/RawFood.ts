import type { DisassemblySourceGroup } from '..';
import getOSItem from '../../util/getOSItem';

const i = getOSItem;

export const RawFood: DisassemblySourceGroup = {
	name: 'Raw Food',
	items: [
		{ item: i('Raw anchovies'), lvl: 1 },
		{ item: i('Raw beef'), lvl: 1 },
		{ item: i('Raw bird meat'), lvl: 1 },
		{ item: i('Raw chicken'), lvl: 1 },
		{ item: i('Raw karambwan'), lvl: 1 },
		{ item: i('Raw karambwanji'), lvl: 1 },
		{ item: i('Raw rabbit'), lvl: 1 },
		{ item: i('Raw rat meat'), lvl: 1 },
		{ item: i('Raw sardine'), lvl: 1 },
		{ item: i('Raw shrimps'), lvl: 1 },
		{ item: i('Raw herring'), lvl: 5 },
		{ item: i('Raw mackerel'), lvl: 10 },
		{ item: i('Raw trout'), lvl: 15 },
		{ item: i('Raw cod'), lvl: 18 },
		{ item: i('Raw pike'), lvl: 20 },
		{ item: i('Raw salmon'), lvl: 25 },
		{ item: i('Raw tuna'), lvl: 30 },
		{ item: i('Raw lobster'), lvl: 40 },
		{ item: i('Raw bass'), lvl: 43 },
		{ item: i('Raw swordfish'), lvl: 45 },
		{ item: i('Raw fish pie'), lvl: 47 },
		{ item: i('Raw lava eel'), lvl: 53 },
		{ item: i('Raw monkfish'), lvl: 62 },
		{ item: i('Raw shark'), lvl: 80 },
		{ item: i('Raw sea turtle'), lvl: 82 },
		{ item: i('Raw anglerfish'), lvl: 84 },
		{ item: i('Raw wild pie'), lvl: 85 },
		{ item: i('Raw cavefish'), lvl: 88 },
		{ item: i('Raw dark crab'), lvl: 90 },
		{ item: i('Raw manta ray'), lvl: 91 },
		{ item: i('Raw summer pie'), lvl: 95 },
		{ item: i('Raw rocktail'), lvl: 99 }
	],
	parts: { organic: 100 }
};
