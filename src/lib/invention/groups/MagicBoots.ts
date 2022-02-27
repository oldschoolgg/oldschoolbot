import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const MagicBoots: DisassemblySourceGroup = {
	name: 'MagicBoots',
	items: [
		{ item: i('Wizard boots'), lvl: 1 },
		{ item: i('Splitbark boots'), lvl: 40 },
		{ item: i('Splitbark gauntlets'), lvl: 40 },
		{ item: i('Skeletal boots'), lvl: 50 },
		{ item: i('Infinity boots'), lvl: 55 },
		{ item: i('Lunar boots'), lvl: 60 }
	],
	parts: {},
	partQuantity: 4
};

export default MagicBoots;
