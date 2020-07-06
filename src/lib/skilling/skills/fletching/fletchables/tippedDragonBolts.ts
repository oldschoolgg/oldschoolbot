import itemID from '../../../../util/itemID';
import { Fletchable } from '../../../types';
import { transformStringBankToNum } from '../../../../util/transformStringBankToNum';

const TippedDragonBolts: Fletchable[] = [
	{
		name: 'Opal dragon bolts',
		id: itemID('Opal dragon bolts'),
		level: 84,
		xp: 1.6,
		inputItems: transformStringBankToNum({ 'Opal bolt tips': 1, 'Dragon bolts': 1 }),
		tickRate: 0.2
	},
	{
		name: 'Jade dragon bolts',
		id: itemID('Jade dragon bolts'),
		level: 84,
		xp: 2.4,
		inputItems: transformStringBankToNum({ 'Jade bolt tips': 1, 'Dragon bolts': 1 }),
		tickRate: 0.2
	},
	{
		name: 'Pearl dragon bolts',
		id: itemID('Pearl dragon bolts'),
		level: 84,
		xp: 3.2,
		inputItems: transformStringBankToNum({ 'Pearl bolt tips': 1, 'Dragon bolts': 1 }),
		tickRate: 0.2
	},
	{
		name: 'Topaz dragon bolts',
		id: itemID('Topaz dragon bolts'),
		level: 84,
		xp: 4,
		inputItems: transformStringBankToNum({ 'Topaz bolt tips': 1, 'Dragon bolts': 1 }),
		tickRate: 0.2
	},
	{
		name: 'Sapphire dragon bolts',
		id: itemID('Sapphire dragon bolts'),
		level: 84,
		xp: 4.7,
		inputItems: transformStringBankToNum({ 'Sapphire bolt tips': 1, 'Dragon bolts': 1 }),
		tickRate: 0.2
	},
	{
		name: 'Emerald dragon bolts',
		id: itemID('Emerald dragon bolts'),
		level: 84,
		xp: 5.5,
		inputItems: transformStringBankToNum({ 'Emerald bolt tips': 1, 'Dragon bolts': 1 }),
		tickRate: 0.2
	},
	{
		name: 'Ruby dragon bolts',
		id: itemID('Ruby dragon bolts'),
		level: 84,
		xp: 6.3,
		inputItems: transformStringBankToNum({ 'Ruby bolt tips': 1, 'Dragon bolts': 1 }),
		tickRate: 0.2
	},
	{
		name: 'Diamond dragon bolts',
		id: itemID('Diamond dragon bolts'),
		level: 84,
		xp: 7,
		inputItems: transformStringBankToNum({ 'Diamond bolt tips': 1, 'Dragon bolts': 1 }),
		tickRate: 0.2
	},
	{
		name: 'Dragonstone dragon bolts',
		id: itemID('Dragonstone dragon bolts'),
		level: 84,
		xp: 8.2,
		inputItems: transformStringBankToNum({ 'Dragonstone bolt tips': 1, 'Dragon bolts': 1 }),
		tickRate: 0.2
	},
	{
		name: 'Onyx dragon bolts',
		id: itemID('Onyx dragon bolts'),
		level: 84,
		xp: 9.4,
		inputItems: transformStringBankToNum({ 'Onyx bolt tips': 1, 'Dragon bolts': 1 }),
		tickRate: 0.2
	}
];

export default TippedDragonBolts;
