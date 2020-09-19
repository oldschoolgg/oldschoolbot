import { resolveNameBank } from '../../../../util';
import itemID from '../../../../util/itemID';
import { Craftable } from '../../../types';

const Gems: Craftable[] = [
	{
		name: 'Opal',
		id: itemID('Opal'),
		level: 1,
		xp: 15,
		inputItems: resolveNameBank({ 'Uncut opal': 1 }),
		tickRate: 2
	},
	{
		name: 'Jade',
		id: itemID('Jade'),
		level: 13,
		xp: 20,
		inputItems: resolveNameBank({ 'Uncut Jade': 1 }),
		tickRate: 2
	},
	{
		name: 'Red topaz',
		id: itemID('Red topaz'),
		level: 16,
		xp: 25,
		inputItems: resolveNameBank({ 'Uncut red topaz': 1 }),
		tickRate: 2
	},
	{
		name: 'Sapphire',
		id: itemID('Sapphire'),
		level: 20,
		xp: 50,
		inputItems: resolveNameBank({ 'Uncut sapphire': 1 }),
		tickRate: 2
	},
	{
		name: 'Emerald',
		id: itemID('Emerald'),
		level: 27,
		xp: 67.5,
		inputItems: resolveNameBank({ 'Uncut Emerald': 1 }),
		tickRate: 2
	},
	{
		name: 'Ruby',
		id: itemID('Ruby'),
		level: 34,
		xp: 85,
		inputItems: resolveNameBank({ 'Uncut ruby': 1 }),
		tickRate: 2
	},
	{
		name: 'Diamond',
		id: itemID('Diamond'),
		level: 43,
		xp: 107.5,
		inputItems: resolveNameBank({ 'Uncut Diamond': 1 }),
		tickRate: 2
	},
	{
		name: 'Dragonstone',
		id: itemID('Dragonstone'),
		level: 55,
		xp: 137.5,
		inputItems: resolveNameBank({ 'Uncut dragonstone': 1 }),
		tickRate: 2
	},
	{
		name: 'Onyx',
		id: itemID('Onyx'),
		level: 67,
		xp: 167.5,
		inputItems: resolveNameBank({ 'Uncut onyx': 1 }),
		tickRate: 2
	},
	{
		name: 'Zenyte',
		id: itemID('Zenyte'),
		level: 89,
		xp: 200,
		inputItems: resolveNameBank({ 'Uncut zenyte': 1 }),
		tickRate: 2
	}
];

export default Gems;
