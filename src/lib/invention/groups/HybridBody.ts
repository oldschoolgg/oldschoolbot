import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const HybridBody: DisassemblySourceGroup = {
	name: 'HybridBody',
	items: [
		{
			item: i('Void knight top'),
			lvl: 42,
			special: { always: true, parts: [{ type: 'pestiferous', chance: 100, amount: 2 }] }
		},
		{ item: i('Obsidian platebody'), lvl: 60 },
		{
			item: i('Crystal body'),
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

export default HybridBody;
