import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Scimitar: DisassemblySourceGroup = {
	name: 'Scimitar',
	items: [
		{
			item: ['Black scimitar', 'White scimitar'].map(i),
			lvl: 25
		},
		{ item: i('Brine sabre'), lvl: 40 },
		{ item: i('Bronze scimitar'), lvl: 1 },
		{ item: i('Iron scimitar'), lvl: 10 },
		{ item: i('Steel scimitar'), lvl: 20 },
		{ item: i('Mithril scimitar'), lvl: 30 },
		{ item: i('Rune scimitar'), lvl: 50 },
		{ item: i('Gilded scimitar'), lvl: 50 },
		{ item: i('Dragon scimitar'), lvl: 60 }
	],
	parts: { sharp: 30, metallic: 30, base: 35 }
};
