import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const WarhammerBase: DisassemblySourceGroup = {
	name: 'WarhammerBase',
	items: [
		{ item: i('Bronze warhammer'), lvl: 1 },
		{ item: i('Iron warhammer'), lvl: 10 },
		{ item: i('Steel warhammer'), lvl: 20 },
		{ item: i('Mithril warhammer'), lvl: 30 },
		{ item: i('Rune warhammer'), lvl: 50 }
	],
	parts: {},
	partQuantity: 8
};

export default WarhammerBase;
