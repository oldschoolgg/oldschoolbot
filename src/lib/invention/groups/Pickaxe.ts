import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Pickaxe: DisassemblySourceGroup = {
	name: 'Pickaxe',
	items: [
		{ item: i('Dragon pickaxe'), lvl: 60, partQuantity: 8 },
		{
			item: i('Crystal pickaxe'),
			lvl: 71,
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
	parts: { heavy: 3, head: 30, direct: 2, base: 35, spiked: 30 }
};

export default Pickaxe;
