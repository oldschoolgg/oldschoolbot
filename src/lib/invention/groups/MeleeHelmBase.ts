import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const MeleeHelmBase: DisassemblySourceGroup = {
	name: 'MeleeHelmBase',
	items: [
		{ item: i('Bronze full helm'), lvl: 1 },
		{ item: i('Bronze med helm'), lvl: 1 },
		{ item: i('Iron full helm'), lvl: 10 },
		{ item: i('Iron med helm'), lvl: 10 },
		{ item: i('Steel full helm'), lvl: 20 },
		{ item: i('Steel med helm'), lvl: 20 },
		{ item: i('Mithril full helm'), lvl: 30 },
		{ item: i('Mithril med helm'), lvl: 30 },
		{ item: i('Rune full helm'), lvl: 50 },
		{ item: i('Rune med helm'), lvl: 50 }
	],
	parts: {},
	partQuantity: 8
};

export default MeleeHelmBase;
