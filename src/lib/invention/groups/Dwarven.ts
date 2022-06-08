import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Dwarven: DisassemblySourceGroup = {
	name: 'Dwarven',
	items: [
		{ item: i('Dwarven ore'), lvl: 50 },
		{ item: i('Dwarven bar'), lvl: 80 },
		{ item: i('Broken dwarven warhammer'), lvl: 100 },
		{ item: i('Dwarven full helm'), lvl: 120 },
		{ item: i('Dwarven platebody'), lvl: 120 },
		{ item: i('Dwarven platelegs'), lvl: 120 },
		{ item: i('Dwarven boots'), lvl: 120 },
		{ item: i('Dwarven gloves'), lvl: 120 },
		{ item: i('Dwarven warhammer'), lvl: 120 },
		{ item: i('Dwarven warhammer (ice)'), lvl: 120 },
		{ item: i('Dwarven warhammer (shadow)'), lvl: 120 },
		{ item: i('Dwarven warhammer (blood)'), lvl: 120 },
		{ item: i('Dwarven warhammer (3a)'), lvl: 120 },
		{ item: i('Dwarven warnana'), lvl: 120 },
		{ item: i('Dwarven battleaxe'), lvl: 120 }
	],
	parts: { dwarven: 100 }
};
