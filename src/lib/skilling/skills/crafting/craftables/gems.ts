import { Bank } from 'oldschooljs';

import itemID from '../../../../util/itemID';
import type { Craftable } from '../../../types';

const Gems: Craftable[] = [
	{
		name: 'Opal',
		id: itemID('Opal'),
		level: 1,
		xp: 15,
		inputItems: new Bank({ 'Uncut opal': 1 }),
		tickRate: 2,
		crushChance: [122 / (98 * 256), 129 / 256]
	},
	{
		name: 'Jade',
		id: itemID('Jade'),
		level: 13,
		xp: 20,
		inputItems: new Bank({ 'Uncut Jade': 1 }),
		tickRate: 2,
		crushChance: [145 / (98 * 256), 101 / 256]
	},
	{
		name: 'Red topaz',
		id: itemID('Red topaz'),
		level: 16,
		xp: 25,
		inputItems: new Bank({ 'Uncut red topaz': 1 }),
		tickRate: 2,
		crushChance: [150 / (98 * 256), 91 / 256]
	},
	{
		name: 'Sapphire',
		id: itemID('Sapphire'),
		level: 20,
		xp: 50,
		inputItems: new Bank({ 'Uncut sapphire': 1 }),
		tickRate: 2
	},
	{
		name: 'Emerald',
		id: itemID('Emerald'),
		level: 27,
		xp: 67.5,
		inputItems: new Bank({ 'Uncut Emerald': 1 }),
		tickRate: 2
	},
	{
		name: 'Ruby',
		id: itemID('Ruby'),
		level: 34,
		xp: 85,
		inputItems: new Bank({ 'Uncut ruby': 1 }),
		tickRate: 2
	},
	{
		name: 'Diamond',
		id: itemID('Diamond'),
		level: 43,
		xp: 107.5,
		inputItems: new Bank({ 'Uncut Diamond': 1 }),
		tickRate: 2
	},
	{
		name: 'Dragonstone',
		id: itemID('Dragonstone'),
		level: 55,
		xp: 137.5,
		inputItems: new Bank({ 'Uncut dragonstone': 1 }),
		tickRate: 2
	},
	{
		name: 'Onyx',
		id: itemID('Onyx'),
		level: 67,
		xp: 167.5,
		inputItems: new Bank({ 'Uncut onyx': 1 }),
		tickRate: 2
	},
	{
		name: 'Zenyte',
		id: itemID('Zenyte'),
		level: 89,
		xp: 200,
		inputItems: new Bank({ 'Uncut zenyte': 1 }),
		tickRate: 2
	}
];

export default Gems;
