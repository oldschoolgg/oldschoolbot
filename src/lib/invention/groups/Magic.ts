import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Magic: DisassemblySourceGroup = {
	name: 'Magic',
	items: [
		{ item: i('Death tiara'), lvl: 1, partQuantity: 6 },
		{ item: i('Fire tiara'), lvl: 1, partQuantity: 6 },
		{
			item: i('Mind helmet'),
			lvl: 1,
			partQuantity: 6,
			special: { always: true, parts: [{ type: 'harnessed', chance: 100, amount: 2 }] }
		}
	],
	parts: { cover: 35, magic: 30, deflecting: 30, powerful: 3, protective: 2 }
};

export default Magic;
