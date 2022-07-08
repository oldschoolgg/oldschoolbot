import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Halberd: DisassemblySourceGroup = {
	name: 'Halberd',
	items: [
		{ item: i('Bronze halberd'), lvl: 1 },
		{ item: i('Iron halberd'), lvl: 10 },
		{ item: i('Steel halberd'), lvl: 20 },
		{
			item: i('Black halberd'),
			lvl: 25
		},
		{
			item: i('White halberd'),
			lvl: 25
		},
		{ item: i('Mithril halberd'), lvl: 30 },
		{ item: i('Adamant halberd'), lvl: 40 },
		{ item: i('Rune halberd'), lvl: 50 },
		{ item: i('Dragon halberd'), lvl: 60, flags: new Set(['orikalkum']) },
		{
			item: i('Crystal halberd'),
			lvl: 70
		},
		{ item: i('Guthix mjolnir'), lvl: 40 },
		{
			item: i('Saradomin mjolnir'),
			lvl: 40
		},
		{
			item: i('Zamorak mjolnir'),
			lvl: 40
		}
	],
	parts: { sharp: 30, heavy: 30, base: 10 }
};
