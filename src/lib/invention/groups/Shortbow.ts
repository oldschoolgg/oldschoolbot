import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Shortbow: DisassemblySourceGroup = {
	name: 'Shortbow',
	items: [
		{
			item: i('Crystal bow'),
			lvl: 70,
			partQuantity: 12,
			special: {
				always: true,
				parts: [
					{ type: 'crystal', chance: 74, amount: 12 },
					{ type: 'seren', chance: 13, amount: 1 },
					{ type: 'faceted', chance: 13, amount: 1 }
				]
			}
		},
		{ item: i('Shortbow'), lvl: 1, partQuantity: 12 },
		{ item: i('Oak shortbow'), lvl: 10, partQuantity: 12 },
		{ item: i('Willow shortbow'), lvl: 20, partQuantity: 12 },
		{ item: i('Comp ogre bow'), lvl: 30, partQuantity: 12 },
		{ item: i('Maple shortbow'), lvl: 30, partQuantity: 12 },
		{ item: i('Yew shortbow'), lvl: 40, partQuantity: 12 },
		{ item: i('Magic shortbow'), lvl: 50, partQuantity: 12 },
		{ item: i('Seercull'), lvl: 50, partQuantity: 12 },
		{ item: i('Training bow'), lvl: 1, partQuantity: 12 },
		{ item: i('Ogre bow'), lvl: 30, partQuantity: 12 },
		{ item: i('Dark bow'), lvl: 70, partQuantity: 12 }
	],
	parts: { flexible: 30, precise: 3, tensile: 30, stave: 35, dextrous: 2 }
};

export default Shortbow;
