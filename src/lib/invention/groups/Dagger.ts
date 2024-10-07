import type { DisassemblySourceGroup } from '..';
import getOSItem from '../../util/getOSItem';

const i = getOSItem;

export const Dagger: DisassemblySourceGroup = {
	name: 'Dagger',
	items: [
		{
			item: i('Black dagger'),
			lvl: 25
		},
		{ item: i('Bronze dagger'), lvl: 1 },
		{ item: i('Iron dagger'), lvl: 10 },
		{ item: i('Steel dagger'), lvl: 20 },
		{ item: i('Mithril dagger'), lvl: 30 },
		{ item: i('Adamant dagger'), lvl: 40 },
		{ item: i('Rune dagger'), lvl: 50 },
		{ item: i('Dragon dagger'), lvl: 60, flags: new Set(['orikalkum']) },
		{ item: i('Toktz-xil-ek'), lvl: 60 },
		{ item: i('Abyssal dagger'), lvl: 90, flags: new Set(['abyssal']) }
	],
	parts: { sharp: 30, base: 10 }
};
