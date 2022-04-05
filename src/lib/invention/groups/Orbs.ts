import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Orbs: DisassemblySourceGroup = {
	name: 'Orbs',
	items: [
		{ item: i("Mage's book"), lvl: 60, partQuantity: 8 },
		{
			item: i('Crystal orb'),
			lvl: 70,
			partQuantity: 8,
			special: {
				always: true,
				parts: [
					{ type: 'crystal', chance: 74, amount: 8 },
					{ type: 'seren', chance: 13, amount: 1 },
					{ type: 'faceted', chance: 13, amount: 1 }
				]
			}
		}
	],
	parts: { delicate: 35, magic: 30, smooth: 30, enhancing: 3, ethereal: 2, faceted: 1 }
};

export default Orbs;
