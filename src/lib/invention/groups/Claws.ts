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
	parts: { connector: 0, blade: 0, spiked: 0, sharp: 0, swift: 0 }
};

export default Claws;
