import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Longsword: DisassemblySourceGroup = {
	name: 'Longsword',
	items: [
		{ item: i('Bronze longsword'), lvl: 1 },
		{ item: i('Iron longsword'), lvl: 10 },
		{ item: i('Steel longsword'), lvl: 20 },
		{
			item: i('Black longsword'),
			lvl: 25
		},
		{ item: i('Mithril longsword'), lvl: 30 },
		{ item: i('Rune longsword'), lvl: 50 },
		{ item: i('Dragon longsword'), lvl: 60 },
		{ item: i('3rd age longsword'), lvl: 65, flags: ['third_age'] },
		{ item: i("Vesta's longsword"), lvl: 78 }
	],
	parts: { sharp: 30, metallic: 30, base: 35, dextrous: 2 }
};
