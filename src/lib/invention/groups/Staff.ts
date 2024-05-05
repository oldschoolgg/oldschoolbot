import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Staff: DisassemblySourceGroup = {
	name: 'Staff',
	items: [
		{ item: i('Magic staff'), lvl: 1 },
		{ item: i('Staff'), lvl: 1 },
		{ item: i('Staff of air'), lvl: 5 },
		{ item: i('Staff of earth'), lvl: 5 },
		{ item: i('Staff of fire'), lvl: 5 },
		{ item: i('Staff of water'), lvl: 5 },
		{ item: i('Battlestaff'), lvl: 70 },
		{ item: i('Air battlestaff'), lvl: 70 },
		{ item: i('Earth battlestaff'), lvl: 70 },
		{ item: i('Fire battlestaff'), lvl: 70 },
		{ item: i('Lava battlestaff'), lvl: 70 },
		{ item: i('Mud battlestaff'), lvl: 70 },
		{ item: i('Steam battlestaff'), lvl: 70 },
		{ item: i('Water battlestaff'), lvl: 70 },
		{ item: i('Mystic air staff'), lvl: 80 },
		{ item: i('Mystic earth staff'), lvl: 80 },
		{ item: i('Mystic fire staff'), lvl: 80 },
		{ item: i('Mystic lava staff'), lvl: 80 },
		{ item: i('Mystic mud staff'), lvl: 80 },
		{ item: i('Mystic steam staff'), lvl: 80 },
		{ item: i('Mystic water staff'), lvl: 80 },
		{ item: i('Toktz-mej-tal'), lvl: 70 },
		{ item: i('Staff of light'), lvl: 90 },
		{ item: i("Zuriel's staff"), lvl: 90 }
	],
	parts: { powerful: 10, magic: 30 }
};
