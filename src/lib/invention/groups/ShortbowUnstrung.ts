import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const ShortbowUnstrung: DisassemblySourceGroup = {
	name: 'ShortbowUnstrung',
	items: [
		{ item: i('Shortbow (u)'), lvl: 1, partQuantity: 4 },
		{ item: i('Oak shortbow (u)'), lvl: 10, partQuantity: 4 },
		{ item: i('Willow shortbow (u)'), lvl: 17, partQuantity: 4 },
		{ item: i('Maple shortbow (u)'), lvl: 25, partQuantity: 4 },
		{ item: i('Yew shortbow (u)'), lvl: 32, partQuantity: 4 },
		{ item: i('Magic shortbow (u)'), lvl: 40, partQuantity: 4 }
	],
	parts: { stave: 35, tensile: 30, flexible: 30, precise: 3, dextrous: 2 }
};

export default ShortbowUnstrung;
