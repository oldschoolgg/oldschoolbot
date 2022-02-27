import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Orbs: DisassemblySourceGroup = {
	name: 'Orbs',
	items: [
		{ item: i("Mage's book"), lvl: 60 },
		{
			item: i('Crystal orb'),
			lvl: 70,
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
	parts: {},
	partQuantity: 8
};

export default Orbs;
