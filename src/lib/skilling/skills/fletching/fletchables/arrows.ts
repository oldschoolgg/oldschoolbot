import { Bank } from 'oldschooljs';

import itemID from '../../../../util/itemID';
import { Fletchable } from '../../../types';

const Arrows: Fletchable[] = [
	{
		name: 'Headless arrow',
		id: itemID('Headless arrow'),
		level: 1,
		xp: 1,
		inputItems: new Bank({ 'Arrow shaft': 1, Feather: 1 }),
		tickRate: 0.13
	},
	{
		name: 'Bronze arrow',
		id: itemID('Bronze arrow'),
		level: 1,
		xp: 1.3,
		inputItems: new Bank({ 'Bronze arrowtips': 1, 'Headless arrow': 1 }),
		tickRate: 0.13
	},
	{
		name: 'Wolfbone arrowtips',
		id: itemID('Wolfbone arrowtips'),
		level: 5,
		xp: 2.5,
		inputItems: new Bank({ 'Wolf bones': 1 }),
		tickRate: 0.13,
		outputMultiple: 4
	},
	{
		name: 'Flighted ogre arrow',
		id: itemID('Flighted ogre arrow'),
		level: 5,
		xp: 9,
		inputItems: new Bank({ 'Ogre arrow shaft': 1, Feather: 6 }),
		tickRate: 0.13
	},
	{
		name: 'Ogre arrow',
		id: itemID('Ogre arrow'),
		level: 5,
		xp: 6,
		inputItems: new Bank({
			'Flighted ogre arrow': 1,
			'Wolfbone arrowtips': 1
		}),
		tickRate: 0.13
	},
	{
		name: 'Iron arrow',
		id: itemID('Iron arrow'),
		level: 15,
		xp: 2.5,
		inputItems: new Bank({ 'Iron arrowtips': 1, 'Headless arrow': 1 }),
		tickRate: 0.13
	},
	{
		name: 'Steel arrow',
		id: itemID('Steel arrow'),
		level: 30,
		xp: 5,
		inputItems: new Bank({ 'Steel arrowtips': 1, 'Headless arrow': 1 }),
		tickRate: 0.13
	},
	{
		name: 'Mithril arrow',
		id: itemID('Mithril arrow'),
		level: 45,
		xp: 7.5,
		inputItems: new Bank({ 'Mithril arrowtips': 1, 'Headless arrow': 1 }),
		tickRate: 0.13
	},
	{
		name: 'Broad arrows',
		id: itemID('Broad arrows'),
		level: 52,
		xp: 10,
		inputItems: new Bank({ 'Broad arrowheads': 1, 'Headless arrow': 1 }),
		tickRate: 0.13
	},
	{
		name: 'Adamant arrow',
		id: itemID('Adamant arrow'),
		level: 60,
		xp: 10,
		inputItems: new Bank({ 'Adamant arrowtips': 1, 'Headless arrow': 1 }),
		tickRate: 0.13
	},
	{
		name: 'Rune arrow',
		id: itemID('Rune arrow'),
		level: 75,
		xp: 12.5,
		inputItems: new Bank({ 'Rune arrowtips': 1, 'Headless arrow': 1 }),
		tickRate: 0.13
	},
	{
		name: 'Amethyst arrow',
		id: itemID('Amethyst arrow'),
		level: 82,
		xp: 13.5,
		inputItems: new Bank({ 'Amethyst arrowtips': 1, 'Headless arrow': 1 }),
		tickRate: 0.13
	},
	{
		name: 'Dragon arrow',
		id: itemID('Dragon arrow'),
		level: 90,
		xp: 15,
		inputItems: new Bank({ 'Dragon arrowtips': 1, 'Headless arrow': 1 }),
		tickRate: 0.13
	}
];

export default Arrows;
