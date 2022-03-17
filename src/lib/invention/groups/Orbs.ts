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
		},
		{ item: i('Bronze pickaxe'), lvl: 1, partQuantity: 8 },
		{ item: i('Iron pickaxe'), lvl: 10, partQuantity: 8 },
		{ item: i('Steel pickaxe'), lvl: 20, partQuantity: 8 },
		{ item: i('Mithril pickaxe'), lvl: 30, partQuantity: 8 },
		{ item: i('Rune pickaxe'), lvl: 50, partQuantity: 8 }
	],
	parts: { delicate: 0, magic: 0, smooth: 0, enhancing: 0, ethereal: 0, faceted: 0 }
};

export default Orbs;
