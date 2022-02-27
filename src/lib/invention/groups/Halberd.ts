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
			lvl: 25,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 12 }] }
		},
		{
			item: i('White halberd'),
			lvl: 25,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 12 }] }
		},
		{ item: i('Mithril halberd'), lvl: 30 },
		{ item: i('Rune halberd'), lvl: 50 },
		{ item: i('Dragon halberd'), lvl: 60 },
		{
			item: i('Crystal halberd'),
			lvl: 70,
			special: {
				always: true,
				parts: [
					{ type: 'crystal', chance: 74, amount: 12 },
					{ type: 'seren', chance: 13, amount: 1 },
					{ type: 'faceted', chance: 13, amount: 1 }
				]
			}
		}
	],
	parts: { blade: 30, stunning: 2, sharp: 3, stave: 35, deflecting: 30 },
	partQuantity: 12
};

export default Halberd;
