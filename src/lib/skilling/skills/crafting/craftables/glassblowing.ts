import { resolveNameBank } from '../../../../util';
import itemID from '../../../../util/itemID';
import { Craftable } from '../../../types';

const Glassblowing: Craftable[] = [
	{
		name: 'Beer glass',
		id: itemID('Beer glass'),
		level: 1,
		xp: 17.5,
		inputItems: resolveNameBank({ 'Molten glass': 1 }),
		tickRate: 3
	},
	{
		name: 'Empty candle lantern',
		id: itemID('Empty candle lantern'),
		level: 4,
		xp: 19,
		inputItems: resolveNameBank({ 'Molten glass': 1 }),
		tickRate: 3
	},
	{
		name: 'Empty oil lamp',
		id: itemID('Empty oil lamp'),
		level: 12,
		xp: 25,
		inputItems: resolveNameBank({ 'Molten glass': 1 }),
		tickRate: 3
	},
	{
		name: 'Vial',
		id: itemID('Vial'),
		level: 33,
		xp: 35,
		inputItems: resolveNameBank({ 'Molten glass': 1 }),
		tickRate: 3
	},
	{
		name: 'Fishbowl',
		id: itemID('Fishbowl'),
		level: 42,
		xp: 42.5,
		inputItems: resolveNameBank({ 'Molten glass': 1 }),
		tickRate: 3
	},
	{
		name: 'Unpowered orb',
		id: itemID('Unpowered orb'),
		level: 46,
		xp: 52.5,
		inputItems: resolveNameBank({ 'Molten glass': 1 }),
		tickRate: 3
	},
	{
		name: 'Lantern lens',
		id: itemID('Lantern lens'),
		level: 49,
		xp: 55,
		inputItems: resolveNameBank({ 'Molten glass': 1 }),
		tickRate: 3
	},
	{
		name: 'Empty light orb',
		id: itemID('Empty light orb'),
		level: 87,
		xp: 70,
		inputItems: resolveNameBank({ 'Molten glass': 1 }),
		tickRate: 3
	}
];

export default Glassblowing;
