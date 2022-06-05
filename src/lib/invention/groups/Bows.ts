import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Bows: DisassemblySourceGroup = {
	name: 'Bows',
	items: [
		{ item: i('Oak shortbow'), lvl: 10 },
		{ item: i('Willow shortbow'), lvl: 20 },
		{ item: i('Comp ogre bow'), lvl: 30 },
		{ item: i('Maple shortbow'), lvl: 30 },
		{ item: i('Yew shortbow'), lvl: 40 },
		{ item: i('Magic shortbow'), lvl: 50 },
		{ item: i('Dark bow'), lvl: 70 },
		{
			item: i('Crystal bow'),
			lvl: 70
		},
		{ item: i('Twisted bow'), lvl: 75 },
		{
			item: [
				'Twisted bownana',
				'Twisted bow (ice)',
				'Twisted bow (shadow)',
				'Twisted bow (blood)',
				'Twisted bow (3a)'
			].map(i),
			lvl: 75,
			flags: new Set(['dyed'])
		},
		{ item: i('Zaryte bow'), lvl: 75 },
		{
			item: [
				'Zaryte bownana',
				'Zaryte bow (ice)',
				'Zaryte bow (shadow)',
				'Zaryte bow (blood)',
				'Zaryte bow (3a)'
			].map(i),
			lvl: 75,
			flags: new Set(['dyed'])
		},
		{
			item: i('Hellfire bow'),
			lvl: 110
		},
		{
			item: i('Hellfire bownana'),
			lvl: 110,
			flags: new Set(['dyed'])
		},
		// Crossbows
		{ item: i('Bronze crossbow'), lvl: 1 },
		{ item: i('Crossbow'), lvl: 1 },
		{ item: i('Iron crossbow'), lvl: 10 },
		{ item: i('Steel crossbow'), lvl: 20 },
		{ item: i('Mithril crossbow'), lvl: 30 },
		{ item: i('Dragon crossbow'), lvl: 60 },
		{ item: i('Rune crossbow'), lvl: 50 },
		{
			item: i("Karil's crossbow"),
			lvl: 70
		},
		{
			item: i('Armadyl crossbow'),
			lvl: 75
		},
		{ item: i('Elder bow'), lvl: 70 }
	],
	parts: { flexible: 30, dextrous: 10, swift: 10 }
};
