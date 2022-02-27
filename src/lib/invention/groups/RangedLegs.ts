import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const RangedLegs: DisassemblySourceGroup = {
	name: 'RangedLegs',
	items: [
		{
			item: i('Studded chaps (g)'),
			lvl: 20,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{
			item: i('Studded chaps (t)'),
			lvl: 20,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{
			item: i('Armadyl robe legs'),
			lvl: 40,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{ item: i('Penance skirt'), lvl: 50 },
		{ item: i('Spined chaps'), lvl: 50 },
		{
			item: i('Armadyl chainskirt'),
			lvl: 70,
			special: { always: true, parts: [{ type: 'armadyl', chance: 100, amount: 8 }] }
		},
		{ item: i("Morrigan's leather chaps"), lvl: 78 }
	],
	parts: {},
	partQuantity: 8
};

export default RangedLegs;
