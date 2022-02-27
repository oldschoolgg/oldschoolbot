import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Shortbow: DisassemblySourceGroup = {
	name: 'Shortbow',
	items: [
		{
			item: i('Crystal bow'),
			lvl: 70,
			special: {
				always: true,
				parts: [
					{ type: 'crystal', chance: 74, amount: 12 },
					{ type: 'seren', chance: 13, amount: 1 },
					{ type: 'faceted', chance: 13, amount: 1 }
				]
			}
		}
	],
	parts: {},
	partQuantity: 12
};

export default Shortbow;
