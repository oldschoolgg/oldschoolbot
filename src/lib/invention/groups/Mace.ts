import type { DisassemblySourceGroup } from '..';
import getOSItem from '../../util/getOSItem';

const i = getOSItem;

export const Mace: DisassemblySourceGroup = {
	name: 'Mace',
	items: [
		{ item: i('Royal sceptre'), lvl: 1 },
		{
			item: i('Black cane'),
			lvl: 23
		},
		{
			item: i('Black mace'),
			lvl: 25
		},
		{
			item: i('White mace'),
			lvl: 25
		},
		{
			item: i('Void knight mace'),
			lvl: 42
		},
		{
			item: i('Rune cane'),
			lvl: 48
		},
		{
			item: i('Dragon cane'),
			lvl: 58
		},
		{ item: i('Dragon mace'), lvl: 60, flags: new Set(['orikalkum']) },
		{ item: i('Tzhaar-ket-em'), lvl: 60 },
		{ item: i('Bronze mace'), lvl: 1 },
		{ item: i('Iron mace'), lvl: 10 },
		{ item: i('Steel mace'), lvl: 20 },
		{ item: i('Mithril mace'), lvl: 30 },
		{ item: i('Adamant mace'), lvl: 40 },
		{ item: i('Rune mace'), lvl: 50 },
		{ item: i("Viggora's chainmace (u)"), lvl: 80 }
	],
	parts: { dextrous: 5, heavy: 15, strong: 35, powerful: 30, metallic: 5 }
};
