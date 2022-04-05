import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Arrows: DisassemblySourceGroup = {
	name: 'Arrows',
	items: [
		{ item: i('Bronze arrow'), lvl: 1, partQuantity: 6 },
		{ item: i('Training arrows'), lvl: 1, partQuantity: 6 },
		{ item: i('Bronze brutal'), lvl: 2, partQuantity: 6 },
		{ item: i('Iron arrow'), lvl: 5, partQuantity: 6 },
		{ item: i('Iron brutal'), lvl: 5, partQuantity: 6 },
		{ item: i('Steel brutal'), lvl: 7, partQuantity: 6 },
		{ item: i('Steel arrow'), lvl: 10, partQuantity: 6 },
		{ item: i('Mithril brutal'), lvl: 11, partQuantity: 6 },
		{ item: i('Mithril arrow'), lvl: 15, partQuantity: 6 },
		{ item: i('Ogre arrow'), lvl: 15, partQuantity: 6 },
		{ item: i('Ice arrows'), lvl: 20, partQuantity: 6 },
		{ item: i('Rune brutal'), lvl: 21, partQuantity: 6 },
		{ item: i('Rune arrow'), lvl: 25, partQuantity: 6 },
		{ item: i('Dragon arrow'), lvl: 30, partQuantity: 6 }
	],
	parts: { precise: 3, head: 30, stave: 40, crafted: 27 }
};

export default Arrows;
