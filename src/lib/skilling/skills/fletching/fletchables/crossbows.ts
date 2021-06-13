import { Bank } from 'oldschooljs';

import itemID from '../../../../util/itemID';
import { Fletchable } from '../../../types';

const Crossbows: Fletchable[] = [
	// stocks
	{
		name: 'Wooden stock',
		id: itemID('Wooden stock'),
		level: 9,
		xp: 6,
		inputItems: new Bank({ Logs: 1 }),
		tickRate: 3
	},
	{
		name: 'Oak stock',
		id: itemID('Oak stock'),
		level: 24,
		xp: 16,
		inputItems: new Bank({ 'Oak logs': 1 }),
		tickRate: 3
	},
	{
		name: 'Willow stock',
		id: itemID('Willow stock'),
		level: 39,
		xp: 22,
		inputItems: new Bank({ 'Willow logs': 1 }),
		tickRate: 3
	},
	{
		name: 'Teak stock',
		id: itemID('Teak stock'),
		level: 46,
		xp: 27,
		inputItems: new Bank({ 'Teak logs': 1 }),
		tickRate: 3
	},
	{
		name: 'Maple stock',
		id: itemID('Maple stock'),
		level: 54,
		xp: 32,
		inputItems: new Bank({ 'Maple logs': 1 }),
		tickRate: 3
	},
	{
		name: 'Mahogany stock',
		id: itemID('Mahogany stock'),
		level: 61,
		xp: 41,
		inputItems: new Bank({ 'Mahogany logs': 1 }),
		tickRate: 3
	},
	{
		name: 'Yew stock',
		id: itemID('Yew stock'),
		level: 69,
		xp: 50,
		inputItems: new Bank({ 'Yew logs': 1 }),
		tickRate: 3
	},
	{
		name: 'Magic stock',
		id: itemID('Magic stock'),
		level: 78,
		xp: 70,
		inputItems: new Bank({ 'Magic logs': 1 }),
		tickRate: 3
	},
	// unfinished cbows
	{
		name: 'Bronze crossbow (u)',
		id: itemID('Bronze crossbow (u)'),
		level: 9,
		xp: 12,
		inputItems: new Bank({ 'Wooden stock': 1, 'Bronze limbs': 1 }),
		tickRate: 2
	},
	{
		name: 'Blurite crossbow (u)',
		id: itemID('Blurite crossbow (u)'),
		level: 24,
		xp: 32,
		inputItems: new Bank({ 'Oak stock': 1, 'Blurite limbs': 1 }),
		tickRate: 2
	},
	{
		name: 'Iron crossbow (u)',
		id: itemID('Iron crossbow (u)'),
		level: 39,
		xp: 44,
		inputItems: new Bank({ 'Willow stock': 1, 'Iron limbs': 1 }),
		tickRate: 2
	},
	{
		name: 'Steel crossbow (u)',
		id: itemID('Steel crossbow (u)'),
		level: 46,
		xp: 54,
		inputItems: new Bank({ 'Teak stock': 1, 'Steel limbs': 1 }),
		tickRate: 2
	},
	{
		name: 'Mithril crossbow (u)',
		id: itemID('Mithril crossbow (u)'),
		level: 54,
		xp: 64,
		inputItems: new Bank({ 'Maple stock': 1, 'Mithril limbs': 1 }),
		tickRate: 2
	},
	{
		name: 'Adamant crossbow (u)',
		id: itemID('Adamant crossbow (u)'),
		level: 61,
		xp: 82,
		inputItems: new Bank({ 'Mahogany stock': 1, 'Adamantite limbs': 1 }),
		tickRate: 2
	},
	{
		name: 'Runite crossbow (u)',
		id: itemID('Runite crossbow (u)'),
		level: 69,
		xp: 100,
		inputItems: new Bank({ 'Yew stock': 1, 'Runite limbs': 1 }),
		tickRate: 2
	},
	{
		name: 'Dragon crossbow (u)',
		id: itemID('Dragon crossbow (u)'),
		level: 78,
		xp: 135,
		inputItems: new Bank({ 'Magic stock': 1, 'Dragon limbs': 1 }),
		tickRate: 2
	},
	// crossbows
	{
		name: 'Bronze crossbow',
		id: itemID('Bronze crossbow'),
		level: 9,
		xp: 6,
		inputItems: new Bank({
			'Bronze crossbow (u)': 1,
			'Crossbow string': 1
		}),
		tickRate: 2
	},
	{
		name: 'Blurite crossbow',
		id: itemID('Blurite crossbow'),
		level: 24,
		xp: 16,
		inputItems: new Bank({
			'Blurite crossbow (u)': 1,
			'Crossbow string': 1
		}),
		tickRate: 2
	},
	{
		name: 'Iron crossbow',
		id: itemID('Iron crossbow'),
		level: 39,
		xp: 22,
		inputItems: new Bank({ 'Iron crossbow (u)': 1, 'Crossbow string': 1 }),
		tickRate: 2
	},
	{
		name: 'Steel crossbow',
		id: itemID('Steel crossbow'),
		level: 46,
		xp: 27,
		inputItems: new Bank({ 'Steel crossbow (u)': 1, 'Crossbow string': 1 }),
		tickRate: 2
	},
	{
		name: 'Mithril crossbow',
		id: itemID('Mithril crossbow'),
		level: 54,
		xp: 32,
		inputItems: new Bank({
			'Mithril crossbow (u)': 1,
			'Crossbow string': 1
		}),
		tickRate: 2
	},
	{
		name: 'Adamant crossbow',
		id: itemID('Adamant crossbow'),
		level: 61,
		xp: 41,
		inputItems: new Bank({
			'Adamant crossbow (u)': 1,
			'Crossbow string': 1
		}),
		tickRate: 2
	},
	{
		name: 'Rune crossbow',
		id: itemID('Rune crossbow'),
		level: 69,
		xp: 50,
		inputItems: new Bank({
			'Runite crossbow (u)': 1,
			'Crossbow string': 1
		}),
		tickRate: 2
	},
	{
		name: 'Dragon crossbow',
		id: itemID('Dragon crossbow'),
		level: 78,
		xp: 70,
		inputItems: new Bank({
			'Dragon crossbow (u)': 1,
			'Crossbow string': 1
		}),
		tickRate: 2
	}
];

export default Crossbows;
