import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Shortbows: DisassemblySourceGroup = {
	name: 'Shortbows',
	items: [
		{ item: i('Shortbow'), lvl: 1 },
		{ item: i('Oak shortbow'), lvl: 10 },
		{ item: i('Willow shortbow'), lvl: 20 },
		{ item: i('Comp ogre bow'), lvl: 30 },
		{ item: i('Maple shortbow'), lvl: 30 },
		{ item: i('Yew shortbow'), lvl: 40 },
		{ item: i('Magic shortbow'), lvl: 50 },
		{ item: i('Seercull'), lvl: 50 }
	],
	parts: { flexible: 30, precise: 3, tensile: 30, stave: 35, dextrous: 2 },
	partQuantity: 12
};

export default Shortbows;
