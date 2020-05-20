import itemID from '../../../../util/itemID';
import { Fletchable } from '../../../types';

const Arrows: Fletchable[] = [
	{
		name: 'Headless arrow',
		id: itemID('Headless arrow'),
		level: 1,
		xp: 1,
		inputItems: { [itemID('Arrow shaft')]: 1, [itemID('Feather')]: 1 },
		tickRate: 0.13
	},
	{
		name: 'Bronze arrow',
		id: itemID('Bronze arrow'),
		level: 1,
		xp: 1.3,
		inputItems: { [itemID('Bronze arrowtips')]: 1, [itemID('Headless arrow')]: 1 },
		tickRate: 0.13
	},
	{
		name: 'Iron arrow',
		id: itemID('Iron arrow'),
		level: 15,
		xp: 2.5,
		inputItems: { [itemID('Iron arrowtips')]: 1, [itemID('Headless arrow')]: 1 },
		tickRate: 0.13
	},
	{
		name: 'Steel arrow',
		id: itemID('Steel arrow'),
		level: 30,
		xp: 5,
		inputItems: { [itemID('Steel arrowtips')]: 1, [itemID('Headless arrow')]: 1 },
		tickRate: 0.13
	},
	{
		name: 'Mithril arrow',
		id: itemID('Mithril arrow'),
		level: 45,
		xp: 7.5,
		inputItems: { [itemID('Mithril arrowtips')]: 1, [itemID('Headless arrow')]: 1 },
		tickRate: 0.13
	},
	{
		name: 'Broad arrows',
		id: itemID('Broad arrows'),
		level: 52,
		xp: 10,
		inputItems: { [itemID('Broad arrowheads')]: 1, [itemID('Headless arrow')]: 1 },
		tickRate: 0.13
	},
	{
		name: 'Adamant arrow',
		id: itemID('Adamant arrow'),
		level: 60,
		xp: 10,
		inputItems: { [itemID('Adamant arrowtips')]: 1, [itemID('Headless arrow')]: 1 },
		tickRate: 0.13
	},
	{
		name: 'Rune arrow',
		id: itemID('Rune arrow'),
		level: 75,
		xp: 12.5,
		inputItems: { [itemID('Rune arrowtips')]: 1, [itemID('Headless arrow')]: 1 },
		tickRate: 0.13
	},
	{
		name: 'Amethyst arrow',
		id: itemID('Amethyst arrow'),
		level: 82,
		xp: 13.5,
		inputItems: { [itemID('Amethyst arrowtips')]: 1, [itemID('Headless arrow')]: 1 },
		tickRate: 0.13
	},
	{
		name: 'Dragon arrow',
		id: itemID('Dragon arrow'),
		level: 90,
		xp: 15,
		inputItems: { [itemID('Dragon arrowtips')]: 1, [itemID('Headless arrow')]: 1 },
		tickRate: 0.13
	}
];

export default Arrows;
