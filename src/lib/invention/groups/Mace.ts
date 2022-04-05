import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Mace: DisassemblySourceGroup = {
	name: 'Mace',
	items: [
		{ item: i('Black flowers'), lvl: 1, partQuantity: 8 },
		{ item: i('Blue flowers'), lvl: 1, partQuantity: 8 },
		{ item: i('Bone club'), lvl: 1, partQuantity: 8 },
		{
			item: i('Briefcase'),
			lvl: 1,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{ item: i('Butterfly net'), lvl: 1, partQuantity: 8 },
		{ item: i('Oak blackjack'), lvl: 1, partQuantity: 8 },
		{ item: i('Orange flowers'), lvl: 1, partQuantity: 8 },
		{ item: i('Purple flowers'), lvl: 1, partQuantity: 8 },
		{ item: i('Red flowers'), lvl: 1, partQuantity: 8 },
		{ item: i('Royal sceptre'), lvl: 1, partQuantity: 8 },
		{ item: i('Trollweiss'), lvl: 1, partQuantity: 8 },
		{ item: i('White flowers'), lvl: 1, partQuantity: 8 },
		{ item: i('Willow blackjack'), lvl: 1, partQuantity: 8 },
		{ item: i('Yellow flowers'), lvl: 1, partQuantity: 8 },
		{ item: i('Oak blackjack(d)'), lvl: 10, partQuantity: 8 },
		{ item: i('Oak blackjack(o)'), lvl: 10, partQuantity: 8 },
		{
			item: i('Frying pan'),
			lvl: 20,
			partQuantity: 8,
			special: { always: false, parts: [{ type: 'culinary', chance: 100, amount: 8 }] }
		},
		{ item: i('Willow blackjack(d)'), lvl: 20, partQuantity: 8 },
		{ item: i('Willow blackjack(o)'), lvl: 20, partQuantity: 8 },
		{
			item: i('Black cane'),
			lvl: 23,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{
			item: i('Black mace'),
			lvl: 25,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 8 }] }
		},
		{
			item: i('White mace'),
			lvl: 25,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 8 }] }
		},
		{ item: i('Maple blackjack'), lvl: 30, partQuantity: 8 },
		{ item: i('Maple blackjack(d)'), lvl: 30, partQuantity: 8 },
		{ item: i('Maple blackjack(o)'), lvl: 30, partQuantity: 8 },
		{
			item: i('Meat tenderiser'),
			lvl: 40,
			partQuantity: 8,
			special: { always: false, parts: [{ type: 'culinary', chance: 100, amount: 8 }] }
		},
		{
			item: i('Rolling pin'),
			lvl: 40,
			partQuantity: 8,
			special: { always: false, parts: [{ type: 'culinary', chance: 100, amount: 8 }] }
		},
		{
			item: i('Void knight mace'),
			lvl: 42,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'pestiferous', chance: 100, amount: 8 }] }
		},
		{
			item: i('Rune cane'),
			lvl: 48,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{
			item: i('Dragon cane'),
			lvl: 58,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{ item: i('Dragon mace'), lvl: 60, partQuantity: 8 },
		{ item: i('Tzhaar-ket-em'), lvl: 60, partQuantity: 8 },
		{
			item: i("Verac's flail"),
			lvl: 70,
			partQuantity: 12,
			special: { always: false, parts: [{ type: 'undead', chance: 100, amount: 12 }] }
		},
		{ item: i('Bronze mace'), lvl: 1, partQuantity: 8 },
		{ item: i('Iron mace'), lvl: 10, partQuantity: 8 },
		{ item: i('Steel mace'), lvl: 20, partQuantity: 8 },
		{ item: i('Mithril mace'), lvl: 30, partQuantity: 8 },
		{ item: i('Rune mace'), lvl: 50, partQuantity: 8 }
	],
	parts: { dextrous: 2, head: 30, heavy: 3, base: 35, smooth: 30 }
};

export default Mace;
