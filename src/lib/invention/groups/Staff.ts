import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Staff: DisassemblySourceGroup = {
	name: 'Staff',
	items: [
		{ item: i('Magic staff'), lvl: 1 },
		{ item: i('Staff'), lvl: 1 },
		{ item: i('Staff of air'), lvl: 1 },
		{ item: i('Staff of earth'), lvl: 1 },
		{ item: i('Staff of fire'), lvl: 1 },
		{ item: i('Staff of water'), lvl: 1 },
		{ item: i('Battlestaff'), lvl: 30 },
		{ item: i('Air battlestaff'), lvl: 30 },
		{ item: i('Earth battlestaff'), lvl: 30 },
		{ item: i('Fire battlestaff'), lvl: 30 },
		{ item: i('Lava battlestaff'), lvl: 30 },
		{ item: i('Mud battlestaff'), lvl: 30 },
		{ item: i('Steam battlestaff'), lvl: 30 },
		{ item: i('Water battlestaff'), lvl: 30 },
		{ item: i('Mystic air staff'), lvl: 40 },
		{ item: i('Mystic earth staff'), lvl: 40 },
		{ item: i('Mystic fire staff'), lvl: 40 },
		{ item: i('Mystic lava staff'), lvl: 40 },
		{ item: i('Mystic mud staff'), lvl: 40 },
		{ item: i('Mystic steam staff'), lvl: 40 },
		{ item: i('Mystic water staff'), lvl: 40 },
		{
			item: i('Armadyl crozier'),
			lvl: 60
		},
		{
			item: i('Bandos crozier'),
			lvl: 60
		},
		{
			item: i('Guthix crozier'),
			lvl: 60
		},
		{
			item: i('Saradomin crozier'),
			lvl: 60
		},
		{ item: i('Toktz-mej-tal'), lvl: 60 },
		{
			item: i('Zamorak crozier'),
			lvl: 60
		},
		{ item: i('Lunar staff'), lvl: 65 },
		{ item: i("Ahrim's staff"), lvl: 65, flags: new Set(['barrows']) },
		{ item: i('Staff of light'), lvl: 75 },
		{ item: i("Zuriel's staff"), lvl: 78 }
	],
	parts: { imbued: 2, powerful: 3, magic: 30 }
};
