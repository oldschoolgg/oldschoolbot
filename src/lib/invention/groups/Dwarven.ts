import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Dwarven: DisassemblySourceGroup = {
	name: 'Dwarven',
	items: [
		{ item: i('Dwarven ore'), lvl: 50 },
		{ item: i('Dwarven bar'), lvl: 80 },
		{ item: i('Broken dwarven warhammer'), lvl: 90 },
		{ item: i('Dwarven full helm'), lvl: 99 },
		{ item: i('Dwarven platebody'), lvl: 99 },
		{ item: i('Dwarven platelegs'), lvl: 99 },
		{ item: i('Dwarven boots'), lvl: 99 },
		{ item: i('Dwarven gloves'), lvl: 99 },
		{ item: i('Dwarven warhammer'), lvl: 99 },
		{ item: i('Dwarven warhammer (ice)'), lvl: 99 },
		{ item: i('Dwarven warhammer (shadow)'), lvl: 99 },
		{ item: i('Dwarven warhammer (blood)'), lvl: 99 },
		{ item: i('Dwarven warhammer (3a)'), lvl: 99 },
		{ item: i('Dwarven warnana'), lvl: 99 },
		{ item: i('Dwarven battleaxe'), lvl: 99 }
	],
	parts: { dwarven: 100 }
};
