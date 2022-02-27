import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Dagger: DisassemblySourceGroup = {
	name: 'Dagger',
	items: [
		{ item: i('Bone dagger'), lvl: 1 },
		{ item: i('Dark dagger'), lvl: 1 },
		{ item: i('Glowing dagger'), lvl: 1 },
		{
			item: i('Black dagger'),
			lvl: 25,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 8 }] }
		},
		{
			item: i('White dagger'),
			lvl: 25,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 8 }] }
		},
		{ item: i('Keris'), lvl: 50 },
		{ item: i('Dragon dagger'), lvl: 60 },
		{ item: i('Toktz-xil-ek'), lvl: 60 }
	],
	parts: { blade: 30, precise: 3, light: 2, base: 35, spiked: 30 },
	partQuantity: 8
};

export default Dagger;
