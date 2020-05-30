import itemID from '../../../../util/itemID';
import { Fletchable } from '../../../types';
import { transformStringBankToNum } from '../../../../util/transformStringBankToNum';

const Arrows: Fletchable[] = [
	{
		name: 'Headless arrow',
		id: itemID('Headless arrow'),
		level: 1,
		xp: 1,
		inputItems: transformStringBankToNum({ 'Arrow shaft': 1, Feather: 1 }),
		tickRate: 0.13
	},
	{
		name: 'Bronze arrow',
		id: itemID('Bronze arrow'),
		level: 1,
		xp: 1.3,
		inputItems: transformStringBankToNum({ 'Bronze arrowtips': 1, 'Headless arrow': 1 }),
		tickRate: 0.13
	},
	{
		name: 'Iron arrow',
		id: itemID('Iron arrow'),
		level: 15,
		xp: 2.5,
		inputItems: transformStringBankToNum({ 'Iron arrowtips': 1, 'Headless arrow': 1 }),
		tickRate: 0.13
	},
	{
		name: 'Steel arrow',
		id: itemID('Steel arrow'),
		level: 30,
		xp: 5,
		inputItems: transformStringBankToNum({ 'Steel arrowtips': 1, 'Headless arrow': 1 }),
		tickRate: 0.13
	},
	{
		name: 'Mithril arrow',
		id: itemID('Mithril arrow'),
		level: 45,
		xp: 7.5,
		inputItems: transformStringBankToNum({ 'Mithril arrowtips': 1, 'Headless arrow': 1 }),
		tickRate: 0.13
	},
	{
		name: 'Broad arrows',
		id: itemID('Broad arrows'),
		level: 52,
		xp: 10,
		inputItems: transformStringBankToNum({ 'Broad arrowheads': 1, 'Headless arrow': 1 }),
		tickRate: 0.13
	},
	{
		name: 'Adamant arrow',
		id: itemID('Adamant arrow'),
		level: 60,
		xp: 10,
		inputItems: transformStringBankToNum({ 'Adamant arrowtips': 1, 'Headless arrow': 1 }),
		tickRate: 0.13
	},
	{
		name: 'Rune arrow',
		id: itemID('Rune arrow'),
		level: 75,
		xp: 12.5,
		inputItems: transformStringBankToNum({ 'Rune arrowtips': 1, 'Headless arrow': 1 }),
		tickRate: 0.13
	},
	{
		name: 'Amethyst arrow',
		id: itemID('Amethyst arrow'),
		level: 82,
		xp: 13.5,
		inputItems: transformStringBankToNum({ 'Amethyst arrowtips': 1, 'Headless arrow': 1 }),
		tickRate: 0.13
	},
	{
		name: 'Dragon arrow',
		id: itemID('Dragon arrow'),
		level: 90,
		xp: 15,
		inputItems: transformStringBankToNum({ 'Dragon arrowtips': 1, 'Headless arrow': 1 }),
		tickRate: 0.13
	}
];

export default Arrows;
