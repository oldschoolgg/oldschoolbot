import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const ShortbowsUnstrung: DisassemblySourceGroup = {
	name: 'ShortbowsUnstrung',
	items: [
		{ item: i('Shortbow (u)'), lvl: 1 },
		{ item: i('Oak shortbow (u)'), lvl: 10 },
		{ item: i('Willow shortbow (u)'), lvl: 17 },
		{ item: i('Maple shortbow (u)'), lvl: 25 },
		{ item: i('Yew shortbow (u)'), lvl: 32 },
		{ item: i('Magic shortbow (u)'), lvl: 40 }
	],
	parts: {},
	partQuantity: 4
};

export default ShortbowsUnstrung;
