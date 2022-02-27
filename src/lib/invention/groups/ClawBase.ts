import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const ClawBase: DisassemblySourceGroup = {
	name: 'ClawBase',
	items: [
		{ item: i('Bronze claws'), lvl: 1 },
		{ item: i('Iron claws'), lvl: 10 },
		{ item: i('Steel claws'), lvl: 20 },
		{ item: i('Mithril claws'), lvl: 30 },
		{ item: i('Rune claws'), lvl: 50 }
	],
	parts: {},
	partQuantity: 8
};

export default ClawBase;
