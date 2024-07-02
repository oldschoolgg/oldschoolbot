import { Bank } from 'oldschooljs';

import itemID from '../../../../util/itemID';
import type { Fletchable } from '../../../types';

const Shafts: Fletchable[] = [
	{
		name: 'Arrow shaft',
		id: itemID('Arrow shaft'),
		level: 1,
		xp: 5,
		inputItems: new Bank({ Logs: 1 }),
		tickRate: 2,
		outputMultiple: 15
	},
	{
		name: 'Javelin shaft',
		id: itemID('Javelin shaft'),
		level: 3,
		xp: 5,
		inputItems: new Bank({ Logs: 1 }),
		tickRate: 2,
		outputMultiple: 15
	},
	{
		name: 'Ogre arrow shaft',
		id: itemID('Ogre arrow shaft'),
		level: 5,
		xp: 7.2,
		inputItems: new Bank({ 'Achey tree logs': 1 }),
		tickRate: 2,
		outputMultiple: 15
	},
	{
		name: 'Oak arrow shaft',
		id: itemID('Arrow shaft'),
		level: 15,
		xp: 10,
		inputItems: new Bank({ 'Oak logs': 1 }),
		tickRate: 2,
		outputMultiple: 30
	},
	{
		name: 'Willow arrow shaft',
		id: itemID('Arrow shaft'),
		level: 30,
		xp: 15,
		inputItems: new Bank({ 'Willow logs': 1 }),
		tickRate: 2,
		outputMultiple: 45
	},
	{
		name: 'Maple arrow shaft',
		id: itemID('Arrow shaft'),
		level: 45,
		xp: 20,
		inputItems: new Bank({ 'Maple logs': 1 }),
		tickRate: 2,
		outputMultiple: 60
	},
	{
		name: 'Yew arrow shaft',
		id: itemID('Arrow shaft'),
		level: 60,
		xp: 25,
		inputItems: new Bank({ 'Yew logs': 1 }),
		tickRate: 2,
		outputMultiple: 75
	},
	{
		name: 'Magic arrow shaft',
		id: itemID('Arrow shaft'),
		level: 75,
		xp: 30,
		inputItems: new Bank({ 'Magic logs': 1 }),
		tickRate: 2,
		outputMultiple: 90
	},
	{
		name: 'Redwood arrow shaft',
		id: itemID('Arrow shaft'),
		level: 90,
		xp: 35,
		inputItems: new Bank({ 'Redwood logs': 1 }),
		tickRate: 2,
		outputMultiple: 105
	},
	{
		name: 'Battlestaff',
		id: itemID('Battlestaff'),
		level: 40,
		xp: 80,
		inputItems: new Bank({ 'Celastrus bark': 1 }),
		tickRate: 4
	}
];

export default Shafts;
