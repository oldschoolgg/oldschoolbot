import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Magic6: DisassemblySourceGroup = {
	name: 'Magic6',
	items: [
		{ item: i('Death tiara'), lvl: 1 },
		{ item: i('Fire tiara'), lvl: 1 },
		{
			item: i('Mind helmet'),
			lvl: 1,
			special: { always: true, parts: [{ type: 'harnessed', chance: 100, amount: 2 }] }
		}
	],
	parts: {},
	partQuantity: 6
};

export default Magic6;
