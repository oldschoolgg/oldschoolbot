import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const MeleeBodyBase: DisassemblySourceGroup = {
	name: 'MeleeBodyBase',
	items: [
		{ item: i('Bronze chainbody'), lvl: 1 },
		{ item: i('Bronze platebody'), lvl: 1 },
		{ item: i('Bronze platelegs'), lvl: 1 },
		{ item: i('Bronze plateskirt'), lvl: 1 },
		{ item: i('Iron chainbody'), lvl: 10 },
		{ item: i('Iron platebody'), lvl: 10 },
		{ item: i('Iron platelegs'), lvl: 10 },
		{ item: i('Steel chainbody'), lvl: 20 },
		{ item: i('Steel platebody'), lvl: 20 },
		{ item: i('Mithril chainbody'), lvl: 30 },
		{ item: i('Mithril platebody'), lvl: 30 },
		{ item: i('Rune chainbody'), lvl: 50 },
		{ item: i('Rune platebody'), lvl: 50 },
		{ item: i('Rune platelegs'), lvl: 50 }
	],
	parts: {},
	partQuantity: 20
};

export default MeleeBodyBase;
