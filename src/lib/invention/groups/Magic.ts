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
	parts: { cover: 0, magic: 0, deflecting: 0, powerful: 0, protective: 0 }
};

export default Magic;
