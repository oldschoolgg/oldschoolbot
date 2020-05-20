import itemID from '../../../../util/itemID';
import { Fletchable } from '../../../types';

const Crossbows: Fletchable[] = [
	// stocks
	{
		name: 'Wooden stock',
		id: itemID('Wooden stock'),
		level: 9,
		xp: 6,
		inputItems: { [itemID('Logs')]: 1 },
		tickRate: 3
	},
	{
		name: 'Oak stock',
		id: itemID('Oak stock'),
		level: 24,
		xp: 16,
		inputItems: { [itemID('Oak logs')]: 1 },
		tickRate: 3
	},
	{
		name: 'Willow stock',
		id: itemID('Willow stock'),
		level: 39,
		xp: 22,
		inputItems: { [itemID('Willow logs')]: 1 },
		tickRate: 3
	},
	{
		name: 'Teak stock',
		id: itemID('Teak stock'),
		level: 46,
		xp: 27,
		inputItems: { [itemID('Teak logs')]: 1 },
		tickRate: 3
	},
	{
		name: 'Maple stock',
		id: itemID('Maple stock'),
		level: 54,
		xp: 32,
		inputItems: { [itemID('Maple logs')]: 1 },
		tickRate: 3
	},
	{
		name: 'Mahogany stock',
		id: itemID('Mahogany stock'),
		level: 61,
		xp: 41,
		inputItems: { [itemID('Mahogany logs')]: 1 },
		tickRate: 3
	},
	{
		name: 'Yew stock',
		id: itemID('Yew stock'),
		level: 69,
		xp: 50,
		inputItems: { [itemID('Yew logs')]: 1 },
		tickRate: 3
	},
	{
		name: 'Magic stock',
		id: itemID('Magic stock'),
		level: 78,
		xp: 70,
		inputItems: { [itemID('Magic logs')]: 1 },
		tickRate: 3
	},
	// unfinished cbows
	{
		name: 'Bronze crossbow (u)',
		id: itemID('Bronze crossbow (u)'),
		level: 9,
		xp: 12,
		inputItems: { [itemID('Wooden stock')]: 1, [itemID('Bronze limbs')]: 1 },
		tickRate: 2
	},
	{
		name: 'Blurite crossbow (u)',
		id: itemID('Blurite crossbow (u)'),
		level: 24,
		xp: 32,
		inputItems: { [itemID('Oak stock')]: 1, [itemID('Blurite limbs')]: 1 },
		tickRate: 2
	},
	{
		name: 'Iron crossbow (u)',
		id: itemID('Iron crossbow (u)'),
		level: 39,
		xp: 44,
		inputItems: { [itemID('Willow stock')]: 1, [itemID('Iron limbs')]: 1 },
		tickRate: 2
	},
	{
		name: 'Steel crossbow (u)',
		id: itemID('Steel crossbow (u)'),
		level: 46,
		xp: 54,
		inputItems: { [itemID('Teak stock')]: 1, [itemID('Steel limbs')]: 1 },
		tickRate: 2
	},
	{
		name: 'Mithril crossbow (u)',
		id: itemID('Mithril crossbow (u)'),
		level: 54,
		xp: 64,
		inputItems: { [itemID('Maple stock')]: 1, [itemID('Mithril limbs')]: 1 },
		tickRate: 2
	},
	{
		name: 'Adamant crossbow (u)',
		id: itemID('Adamant crossbow (u)'),
		level: 61,
		xp: 82,
		inputItems: { [itemID('Mahogany stock')]: 1, [itemID('Adamantite limbs')]: 1 },
		tickRate: 2
	},
	{
		name: 'Runite crossbow (u)',
		id: itemID('Runite crossbow (u)'),
		level: 69,
		xp: 100,
		inputItems: { [itemID('Yew stock')]: 1, [itemID('Runite limbs')]: 1 },
		tickRate: 2
	},
	{
		name: 'Dragon crossbow (u)',
		id: itemID('Dragon crossbow (u)'),
		level: 78,
		xp: 135,
		inputItems: { [itemID('Magic stock')]: 1, [itemID('Dragon limbs')]: 1 },
		tickRate: 2
	},
	// crossbows
	{
		name: 'Bronze crossbow',
		id: itemID('Bronze crossbow'),
		level: 9,
		xp: 6,
		inputItems: { [itemID('Bronze crossbow (u)')]: 1, [itemID('Crossbow string')]: 1 },
		tickRate: 2
	},
	{
		name: 'Blurite crossbow',
		id: itemID('Blurite crossbow'),
		level: 24,
		xp: 16,
		inputItems: { [itemID('Blurite crossbow (u)')]: 1, [itemID('Crossbow string')]: 1 },
		tickRate: 2
	},
	{
		name: 'Iron crossbow',
		id: itemID('Iron crossbow'),
		level: 39,
		xp: 22,
		inputItems: { [itemID('Iron crossbow (u)')]: 1, [itemID('Crossbow string')]: 1 },
		tickRate: 2
	},
	{
		name: 'Steel crossbow',
		id: itemID('Steel crossbow'),
		level: 46,
		xp: 27,
		inputItems: { [itemID('Steel crossbow (u)')]: 1, [itemID('Crossbow string')]: 1 },
		tickRate: 2
	},
	{
		name: 'Mith crossbow',
		id: itemID('Mith crossbow'),
		level: 54,
		xp: 32,
		inputItems: { [itemID('Mithril crossbow (u)')]: 1, [itemID('Crossbow string')]: 1 },
		tickRate: 2
	},
	{
		name: 'Adamant crossbow',
		id: itemID('Adamant crossbow'),
		level: 61,
		xp: 41,
		inputItems: { [itemID('Adamant crossbow (u)')]: 1, [itemID('Crossbow string')]: 1 },
		tickRate: 2
	},
	{
		name: 'Rune crossbow',
		id: itemID('Rune crossbow'),
		level: 69,
		xp: 50,
		inputItems: { [itemID('Runite crossbow (u)')]: 1, [itemID('Crossbow string')]: 1 },
		tickRate: 2
	},
	{
		name: 'Dragon crossbow',
		id: itemID('Dragon crossbow'),
		level: 78,
		xp: 70,
		inputItems: { [itemID('Dragon crossbow (u)')]: 1, [itemID('Crossbow string')]: 1 },
		tickRate: 2
	}
];

export default Crossbows;
