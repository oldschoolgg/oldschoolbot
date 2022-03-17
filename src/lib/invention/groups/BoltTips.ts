import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const BoltTips: DisassemblySourceGroup = {
	name: 'BoltTips',
	items: [
		{ item: i('Bronze bolts (unf)'), lvl: 1, partQuantity: 2 },
		{ item: i('Silver bolts (unf)'), lvl: 1, partQuantity: 2 },
		{ item: i('Blurite bolts (unf)'), lvl: 2, partQuantity: 2 },
		{ item: i('Opal bolt tips'), lvl: 2, partQuantity: 2 },
		{ item: i('Iron bolts (unf)'), lvl: 4, partQuantity: 2 },
		{ item: i('Jade bolt tips'), lvl: 6, partQuantity: 2 },
		{ item: i('Topaz bolt tips'), lvl: 12, partQuantity: 2 },
		{ item: i('Unfinished broad bolts'), lvl: 12, partQuantity: 2 },
		{ item: i('Mithril bolts (unf)'), lvl: 13, partQuantity: 2 },
		{ item: i('Emerald bolt tips'), lvl: 14, partQuantity: 2 },
		{ item: i('Sapphire bolt tips'), lvl: 14, partQuantity: 2 },
		{ item: i('Ruby bolt tips'), lvl: 15, partQuantity: 2 },
		{ item: i('Onyx bolt tips'), lvl: 18, partQuantity: 2 },
		{ item: i('Barb bolttips'), lvl: 22, partQuantity: 2 }
	],
	parts: { base: 40, head: 30, spiked: 27, stunning: 3 }
};

export default BoltTips;
