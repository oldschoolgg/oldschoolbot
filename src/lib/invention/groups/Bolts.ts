import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Bolts: DisassemblySourceGroup = {
	name: 'Bolts',
	items: [
		{ item: i('Bronze bolts'), lvl: 1, partQuantity: 6 },
		{ item: i('Iron bolts'), lvl: 5, partQuantity: 6 },
		{ item: i('Opal bolts'), lvl: 5, partQuantity: 6 },
		{
			item: i('Black brutal'),
			lvl: 10,
			partQuantity: 6,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 6 }] }
		},
		{ item: i('Opal bolts (e)'), lvl: 10, partQuantity: 6 },
		{ item: i('Pearl bolts'), lvl: 10, partQuantity: 6 },
		{ item: i('Steel bolts'), lvl: 10, partQuantity: 6 },
		{ item: i('Jade bolts'), lvl: 12, partQuantity: 6 },
		{ item: i('Silver bolts'), lvl: 12, partQuantity: 6 },
		{ item: i('Bone bolts'), lvl: 14, partQuantity: 6 },
		{ item: i('Mithril bolts'), lvl: 15, partQuantity: 6 },
		{ item: i('Pearl bolts (e)'), lvl: 15, partQuantity: 6 },
		{ item: i('Steel bolts (p+)'), lvl: 15, partQuantity: 6 },
		{ item: i('Topaz bolts'), lvl: 15, partQuantity: 6 },
		{ item: i('Jade bolts (e)'), lvl: 17, partQuantity: 6 },
		{ item: i('Sapphire bolts'), lvl: 20, partQuantity: 6 },
		{ item: i('Topaz bolts (e)'), lvl: 20, partQuantity: 6 },
		{ item: i('Emerald bolts'), lvl: 25, partQuantity: 6 },
		{ item: i('Kebbit bolts'), lvl: 25, partQuantity: 6 },
		{ item: i('Long kebbit bolts'), lvl: 25, partQuantity: 6 },
		{ item: i('Ruby bolts'), lvl: 25, partQuantity: 6 },
		{ item: i('Sapphire bolts (e)'), lvl: 25, partQuantity: 6 },
		{ item: i('Diamond bolts'), lvl: 30, partQuantity: 6 },
		{ item: i('Dragon bolts'), lvl: 30, partQuantity: 6 },
		{ item: i('Emerald bolts (e)'), lvl: 30, partQuantity: 6 },
		{ item: i('Ruby bolts (e)'), lvl: 30, partQuantity: 6 },
		{ item: i('Bolt rack'), lvl: 35, partQuantity: 6 },
		{ item: i('Diamond bolts (e)'), lvl: 35, partQuantity: 6 },
		{ item: i('Onyx bolts'), lvl: 35, partQuantity: 6 },
		{ item: i('Onyx bolts (e)'), lvl: 40, partQuantity: 6 }
	],
	parts: { stunning: 3, head: 30, base: 40, spiked: 27 }
};

export default Bolts;
