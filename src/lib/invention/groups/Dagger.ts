import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Dagger: DisassemblySourceGroup = {
	name: 'Dagger',
	items: [
		{
			item: i('Black dagger'),
			lvl: 25,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 8 }] }
		},
		{
			item: i('White dagger'),
			lvl: 25,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 8 }] }
		},
		{ item: i('Dragon dagger'), lvl: 60, partQuantity: 8 },
		{ item: i('Toktz-xil-ek'), lvl: 60, partQuantity: 8 },
		{ item: i('Bronze dagger'), lvl: 1, partQuantity: 8 },
		{ item: i('Iron dagger'), lvl: 10, partQuantity: 8 },
		{ item: i('Steel dagger'), lvl: 20, partQuantity: 8 },
		{ item: i('Mithril dagger'), lvl: 30, partQuantity: 8 },
		{ item: i('Rune dagger'), lvl: 50, partQuantity: 8 }
	],
	parts: { blade: 30, precise: 3, light: 2, base: 35, spiked: 30 }
};

export default Dagger;
