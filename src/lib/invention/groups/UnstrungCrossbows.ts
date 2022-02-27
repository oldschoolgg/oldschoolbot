import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const UnstrungCrossbows: DisassemblySourceGroup = {
	name: 'UnstrungCrossbows',
	items: [
		{ item: i('Bronze crossbow (u)'), lvl: 4 },
		{ item: i('Iron crossbow (u)'), lvl: 19 },
		{ item: i('Steel crossbow (u)'), lvl: 23 },
		{ item: i('Mithril crossbow (u)'), lvl: 27 },
		{ item: i('Runite crossbow (u)'), lvl: 34 },
		{ item: i('Dragon crossbow (u)'), lvl: 47 }
	],
	parts: {},
	partQuantity: 4
};

export default UnstrungCrossbows;
