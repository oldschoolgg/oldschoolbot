import type { DisassemblySourceGroup } from '..';
import getOSItem from '../../util/getOSItem';

const i = getOSItem;

export const Explosive: DisassemblySourceGroup = {
	name: 'Explosive',
	items: [
		{ item: i('Red chinchompa'), lvl: 75 },
		{ item: i('Black chinchompa'), lvl: 90 }
	],
	parts: { explosive: 90, organic: 10 }
};
