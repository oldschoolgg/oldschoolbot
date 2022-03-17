import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Claws: DisassemblySourceGroup = {
	name: 'Claws',
	items: [
		{ item: i('Bronze claws'), lvl: 1, partQuantity: 8 },
		{ item: i('Iron claws'), lvl: 10, partQuantity: 8 },
		{ item: i('Steel claws'), lvl: 20, partQuantity: 8 },
		{ item: i('Mithril claws'), lvl: 30, partQuantity: 8 },
		{ item: i('Rune claws'), lvl: 50, partQuantity: 8 }
	],
	parts: { connector: 35, blade: 30, spiked: 30, sharp: 3, swift: 2 }
};

export default Claws;
