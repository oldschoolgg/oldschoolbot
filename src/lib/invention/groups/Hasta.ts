import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Hasta: DisassemblySourceGroup = {
	name: 'Hasta',
	items: [
		{ item: i('Bronze hasta'), lvl: 1, partQuantity: 8 },
		{ item: i('Iron hasta'), lvl: 10, partQuantity: 8 },
		{ item: i('Steel hasta'), lvl: 20, partQuantity: 8 },
		{ item: i('Mithril hasta'), lvl: 30, partQuantity: 8 },
		{ item: i('Rune hasta'), lvl: 50, partQuantity: 8 },
		{ item: i('Dragon hasta'), lvl: 60, partQuantity: 8 }
	],
	parts: { stave: 0, blade: 0, crafted: 0, precise: 0, direct: 0 }
};

export default Hasta;
