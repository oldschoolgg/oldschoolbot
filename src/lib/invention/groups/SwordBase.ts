import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const SwordBase: DisassemblySourceGroup = {
	name: 'SwordBase',
	items: [
		{ item: i('Bronze sword'), lvl: 1 },
		{ item: i('Iron sword'), lvl: 10 },
		{ item: i('Steel sword'), lvl: 20 },
		{ item: i('Mithril sword'), lvl: 30 },
		{ item: i('Rune sword'), lvl: 50 }
	],
	parts: {},
	partQuantity: 8
};

export default SwordBase;
