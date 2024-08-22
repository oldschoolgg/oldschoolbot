import type { DisassemblySourceGroup } from '..';
import getOSItem from '../../util/getOSItem';

const i = getOSItem;

export const Bows: DisassemblySourceGroup = {
	name: 'Bows',
	items: [
		{ item: i('Shortbow'), lvl: 1 },
		{ item: i('Longbow'), lvl: 5 },
		{ item: i('Oak shortbow'), lvl: 20 },
		{ item: i('Oak longbow'), lvl: 25 },
		{ item: i('Willow shortbow'), lvl: 35 },
		{ item: i('Willow longbow'), lvl: 40 },
		{ item: i('Willow comp bow'), lvl: 45 },
		{ item: i('Comp ogre bow'), lvl: 50 },
		{ item: i('Maple shortbow'), lvl: 55 },
		{ item: i('Maple longbow'), lvl: 60 },
		{ item: i('Yew shortbow'), lvl: 70 },
		{ item: i('Yew longbow'), lvl: 75 },
		{ item: i('Yew comp bow'), lvl: 75 },
		{ item: i('Magic shortbow'), lvl: 80 },
		{ item: i('Magic longbow'), lvl: 85 },
		{ item: i('Elder bow'), lvl: 99 },

		{ item: i('Dark bow'), lvl: 99 },
		{
			item: i('Crystal bow'),
			lvl: 70
		},
		{ item: i('Twisted bow'), lvl: 99 },
		{
			item: [
				'Twisted bownana',
				'Twisted bow (ice)',
				'Twisted bow (shadow)',
				'Twisted bow (blood)',
				'Twisted bow (3a)'
			].map(i),
			lvl: 99,
			flags: new Set(['dyed'])
		},
		{ item: i('Zaryte bow'), lvl: 99 },
		{
			item: [
				'Zaryte bownana',
				'Zaryte bow (ice)',
				'Zaryte bow (shadow)',
				'Zaryte bow (blood)',
				'Zaryte bow (3a)'
			].map(i),
			lvl: 99,
			flags: new Set(['dyed'])
		},
		{
			item: i('Hellfire bow'),
			lvl: 99
		},
		{
			item: i('Hellfire bownana'),
			lvl: 99,
			flags: new Set(['dyed'])
		},
		// Crossbows
		{ item: i('Bronze crossbow'), lvl: 1 },
		{ item: i('Crossbow'), lvl: 1 },
		{ item: i('Iron crossbow'), lvl: 10 },
		{ item: i('Steel crossbow'), lvl: 20 },
		{ item: i('Mithril crossbow'), lvl: 30 },
		{ item: i('Rune crossbow'), lvl: 69 },
		{ item: i('Dragon crossbow'), lvl: 78 },
		{ item: i('Royal crossbow'), lvl: 87 },
		{
			item: i('Armadyl crossbow'),
			lvl: 99
		},
		{
			item: i("Craw's bow (u)"),
			lvl: 99
		}
	],
	parts: { flexible: 30, dextrous: 20, swift: 20 }
};
