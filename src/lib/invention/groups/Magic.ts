import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Magic: DisassemblySourceGroup = {
	name: 'Magic',
	items: [
		{ item: i('Death tiara'), lvl: 1 },
		{ item: i('Fire tiara'), lvl: 1 },
		{
			item: i('Mind helmet'),
			lvl: 1
		}
	],
	parts: { cover: 35, magic: 30, powerful: 3, protective: 2 }
};
