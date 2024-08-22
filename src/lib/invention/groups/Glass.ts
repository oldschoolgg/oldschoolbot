import type { DisassemblySourceGroup } from '..';
import getOSItem from '../../util/getOSItem';

const i = getOSItem;

export const Glass: DisassemblySourceGroup = {
	name: 'Glass',
	items: [
		{ item: i('Vial'), lvl: 1 },
		{ item: i('Vial of water'), lvl: 1 },
		{ item: i('Molten glass'), lvl: 25 },
		{ item: i('Beer glass'), lvl: 1 },
		{ item: i('Fishbowl'), lvl: 42 },
		{ item: i('Unpowered orb'), lvl: 46 },
		{ item: i('Lantern lens'), lvl: 49 },
		{ item: i('Water orb'), lvl: 56 },
		{ item: i('Earth orb'), lvl: 60 },
		{ item: i('Fire orb'), lvl: 63 }
	],
	parts: { precious: 20, smooth: 40 }
};

export default Glass;
