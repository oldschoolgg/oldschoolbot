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
		{ item: i('Rune halberd'), lvl: 50 },
		{ item: i('Dragon halberd'), lvl: 60 },
		{
			item: i('Crystal halberd'),
			lvl: 70,
			special: {
				always: true,
				parts: [{ type: 'crystal', chance: 74, amount: 12 }]
			}
		},
		{ item: i('Guthix mjolnir'), lvl: 40 },
		{
			item: i('Saradomin mjolnir'),
			lvl: 40,

			special: {
				always: true,
				parts: [
					{ type: 'base', chance: 100, amount: 8 },
					{ type: 'saradomin', chance: 100, amount: 1 }
				]
			}
		},
		{
			item: i('Zamorak mjolnir'),
			lvl: 40,

			special: {
				always: true,
				parts: [
					{ type: 'base', chance: 100, amount: 8 },
					{ type: 'zamorak', chance: 100, amount: 1 }
				]
			}
		}
	],
	parts: { blade: 30, sharp: 3, protective: 5 }
};
