import { Bank } from 'oldschooljs';

import itemID from '../../../../util/itemID';
import type { Craftable } from '../../../types';

const Dragonhide: Craftable[] = [
	{
		name: "Green d'hide vambraces",
		id: itemID("Green d'hide vambraces"),
		level: 57,
		xp: 62,
		inputItems: new Bank({ 'Green dragon leather': 1 }),
		tickRate: 3
	},
	{
		name: "Green d'hide chaps",
		id: itemID("Green d'hide chaps"),
		level: 60,
		xp: 124,
		inputItems: new Bank({ 'Green dragon leather': 2 }),
		tickRate: 3.5
	},
	{
		name: "Green d'hide shield",
		id: itemID("Green d'hide shield"),
		level: 62,
		xp: 124,
		inputItems: new Bank({
			'Green dragon leather': 2,
			'Maple shield': 1,
			'Steel nails': 15
		}),
		tickRate: 5
	},
	{
		name: "Green d'hide body",
		id: itemID("Green d'hide body"),
		level: 63,
		xp: 186,
		inputItems: new Bank({ 'Green dragon leather': 3 }),
		tickRate: 3.5
	},
	{
		name: "Blue d'hide vambraces",
		id: itemID("Blue d'hide vambraces"),
		level: 66,
		xp: 70,
		inputItems: new Bank({ 'Blue dragon leather': 1 }),
		tickRate: 3
	},
	{
		name: "Blue d'hide chaps",
		id: itemID("Blue d'hide chaps"),
		level: 68,
		xp: 140,
		inputItems: new Bank({ 'Blue dragon leather': 2 }),
		tickRate: 3.5
	},
	{
		name: "Blue d'hide shield",
		id: itemID("Blue d'hide shield"),
		level: 69,
		xp: 140,
		inputItems: new Bank({
			'Blue dragon leather': 2,
			'Yew shield': 1,
			'Mithril nails': 15
		}),
		tickRate: 5
	},
	{
		name: "Blue d'hide body",
		id: itemID("Blue d'hide body"),
		level: 71,
		xp: 210,
		inputItems: new Bank({ 'Blue dragon leather': 3 }),
		tickRate: 3.5
	},
	{
		name: "Red d'hide vambraces",
		id: itemID("Red d'hide vambraces"),
		level: 73,
		xp: 78,
		inputItems: new Bank({ 'Red dragon leather': 1 }),
		tickRate: 3
	},
	{
		name: "Red d'hide chaps",
		id: itemID("Red d'hide chaps"),
		level: 75,
		xp: 156,
		inputItems: new Bank({ 'Red dragon leather': 2 }),
		tickRate: 3.5
	},
	{
		name: "Red d'hide shield",
		id: itemID("Red d'hide shield"),
		level: 76,
		xp: 156,
		inputItems: new Bank({
			'Red dragon leather': 2,
			'Magic shield': 1,
			'Adamantite nails': 15
		}),
		tickRate: 5
	},
	{
		name: "Red d'hide body",
		id: itemID("Red d'hide body"),
		level: 77,
		xp: 234,
		inputItems: new Bank({ 'Red dragon leather': 3 }),
		tickRate: 3.5
	},
	{
		name: "Black d'hide vambraces",
		id: itemID("Black d'hide vambraces"),
		level: 79,
		xp: 86,
		inputItems: new Bank({ 'Black dragon leather': 1 }),
		tickRate: 3
	},
	{
		name: "Black d'hide chaps",
		id: itemID("Black d'hide chaps"),
		level: 82,
		xp: 172,
		inputItems: new Bank({ 'Black dragon leather': 2 }),
		tickRate: 3.5
	},
	{
		name: "Black d'hide shield",
		id: itemID("Black d'hide shield"),
		level: 83,
		xp: 172,
		inputItems: new Bank({
			'Black dragon leather': 2,
			'Redwood shield': 1,
			'Rune nails': 15
		}),
		tickRate: 5
	},
	{
		name: "Black d'hide body",
		id: itemID("Black d'hide body"),
		level: 84,
		xp: 258,
		inputItems: new Bank({ 'Black dragon leather': 3 }),
		tickRate: 3.5
	}
];

export default Dragonhide;
