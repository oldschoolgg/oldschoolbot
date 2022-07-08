import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Bows: DisassemblySourceGroup = {
	name: 'Bows',
	items: [
		{ item: i('Shortbow'), lvl: 1 },
		{ item: i('Longbow'), lvl: 5 },
		{ item: i('Oak shortbow'), lvl: 10 },
		{ item: i('Oak longbow'), lvl: 15 },
		{ item: i('Willow shortbow'), lvl: 20 },
		{ item: i('Willow longbow'), lvl: 25 },
		{ item: i('Willow comp bow'), lvl: 25 },
		{ item: i('Comp ogre bow'), lvl: 30 },
		{ item: i('Maple shortbow'), lvl: 40, outputMultiplier: 3 },
		{ item: i('Maple longbow'), lvl: 45, outputMultiplier: 3 },
		{ item: i('Yew shortbow'), lvl: 50, outputMultiplier: 3 },
		{ item: i('Yew longbow'), lvl: 50, outputMultiplier: 3 },
		{ item: i('Yew comp bow'), lvl: 55, outputMultiplier: 3 },
		{ item: i('Magic shortbow'), lvl: 60, outputMultiplier: 3 },
		{ item: i('Magic longbow'), lvl: 65, outputMultiplier: 3 },
		{ item: i('Elder bow'), lvl: 80, outputMultiplier: 12 },

		{ item: i('Dark bow'), lvl: 90, outputMultiplier: 30 },
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
		{ item: i('Rune crossbow'), lvl: 50, outputMultiplier: 4 },
		{ item: i('Dragon crossbow'), lvl: 60, outputMultiplier: 10 },
		{ item: i('Royal crossbow'), lvl: 70, outputMultiplier: 30 },
		{
			item: i('Armadyl crossbow'),
			lvl: 99,
			outputMultiplier: 200
		},
		{
			item: i("Craw's bow (u)"),
			lvl: 99,
			outputMultiplier: 100
		}
	],
	parts: { flexible: 40, dextrous: 20, swift: 20 }
};
