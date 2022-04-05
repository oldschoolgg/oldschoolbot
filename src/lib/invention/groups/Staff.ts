import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Staff: DisassemblySourceGroup = {
	name: 'Staff',
	items: [
		{ item: i('Dramen staff'), lvl: 1, partQuantity: 12 },
		{ item: i('Magic staff'), lvl: 1, partQuantity: 12 },
		{ item: i('Skull sceptre'), lvl: 1, partQuantity: 12 },
		{ item: i('Staff'), lvl: 1, partQuantity: 12 },
		{ item: i('Staff of air'), lvl: 1, partQuantity: 12 },
		{ item: i('Staff of earth'), lvl: 1, partQuantity: 12 },
		{ item: i('Staff of fire'), lvl: 1, partQuantity: 12 },
		{ item: i('Staff of water'), lvl: 1, partQuantity: 12 },
		{
			item: i('White magic staff'),
			lvl: 25,
			partQuantity: 12,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 12 }] }
		},
		{ item: i('Battlestaff'), lvl: 30, partQuantity: 12 },
		{ item: i('Earth battlestaff'), lvl: 30, partQuantity: 12 },
		{ item: i('Fire battlestaff'), lvl: 30, partQuantity: 12 },
		{ item: i('Lava battlestaff'), lvl: 30, partQuantity: 12 },
		{ item: i('Mud battlestaff'), lvl: 30, partQuantity: 12 },
		{ item: i('Steam battlestaff'), lvl: 30, partQuantity: 12 },
		{ item: i('Water battlestaff'), lvl: 30, partQuantity: 12 },
		{ item: i('Mystic air staff'), lvl: 40, partQuantity: 12 },
		{ item: i('Mystic earth staff'), lvl: 40, partQuantity: 12 },
		{ item: i('Mystic fire staff'), lvl: 40, partQuantity: 12 },
		{ item: i('Mystic lava staff'), lvl: 40, partQuantity: 12 },
		{ item: i('Mystic mud staff'), lvl: 40, partQuantity: 12 },
		{ item: i('Mystic steam staff'), lvl: 40, partQuantity: 12 },
		{ item: i('Mystic water staff'), lvl: 40, partQuantity: 12 },
		{ item: i("Iban's staff"), lvl: 50, partQuantity: 12 },
		{ item: i("Slayer's staff"), lvl: 55, partQuantity: 12 },
		{
			item: i('Armadyl crozier'),
			lvl: 60,
			partQuantity: 12,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 12 }] }
		},
		{
			item: i('Bandos crozier'),
			lvl: 60,
			partQuantity: 12,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 12 }] }
		},
		{
			item: i('Guthix crozier'),
			lvl: 60,
			partQuantity: 12,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 12 }] }
		},
		{
			item: i('Saradomin crozier'),
			lvl: 60,
			partQuantity: 12,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 12 }] }
		},
		{ item: i('Toktz-mej-tal'), lvl: 60, partQuantity: 12 },
		{
			item: i('Zamorak crozier'),
			lvl: 60,
			partQuantity: 12,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 12 }] }
		},
		{ item: i('Lunar staff'), lvl: 65, partQuantity: 12 },
		{ item: i('Staff of light'), lvl: 75, partQuantity: 12 },
		{ item: i("Zuriel's staff"), lvl: 78, partQuantity: 12 }
	],
	parts: { padded: 30, imbued: 2, powerful: 3, stave: 35, magic: 30 }
};

export default Staff;
