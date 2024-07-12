import { Bank } from 'oldschooljs';

import itemID from '../../../../util/itemID';
import type { Fletchable } from '../../../types';

const Tips: Fletchable[] = [
	{
		name: 'Opal bolt tips',
		id: itemID('Opal bolt tips'),
		level: 11,
		xp: 1.5,
		inputItems: new Bank({ Opal: 1 }),
		tickRate: 5,
		outputMultiple: 12
	},
	{
		name: 'Jade bolt tips',
		id: itemID('Jade bolt tips'),
		level: 26,
		xp: 2.4,
		inputItems: new Bank({ Jade: 1 }),
		tickRate: 5,
		outputMultiple: 12
	},
	{
		name: 'Pearl bolt tips',
		id: itemID('Pearl bolt tips'),
		level: 41,
		xp: 3.2,
		inputItems: new Bank({ 'Oyster pearls': 1 }),
		tickRate: 5,
		outputMultiple: 24
	},
	{
		name: 'Topaz bolt tips',
		id: itemID('Topaz bolt tips'),
		level: 48,
		xp: 3.9,
		inputItems: new Bank({ 'Red topaz': 1 }),
		tickRate: 5,
		outputMultiple: 12
	},
	{
		name: 'Sapphire bolt tips',
		id: itemID('Sapphire bolt tips'),
		level: 56,
		xp: 4.7,
		inputItems: new Bank({ Sapphire: 1 }),
		tickRate: 5,
		outputMultiple: 12
	},
	{
		name: 'Emerald bolt tips',
		id: itemID('Emerald bolt tips'),
		level: 58,
		xp: 5.5,
		inputItems: new Bank({ Emerald: 1 }),
		tickRate: 5,
		outputMultiple: 12
	},
	{
		name: 'Ruby bolt tips',
		id: itemID('Ruby bolt tips'),
		level: 63,
		xp: 6.3,
		inputItems: new Bank({ Ruby: 1 }),
		tickRate: 5,
		outputMultiple: 12
	},
	{
		name: 'Diamond bolt tips',
		id: itemID('Diamond bolt tips'),
		level: 65,
		xp: 7,
		inputItems: new Bank({ Diamond: 1 }),
		tickRate: 5,
		outputMultiple: 12
	},
	{
		name: 'Dragonstone bolt tips',
		id: itemID('Dragonstone bolt tips'),
		level: 71,
		xp: 8.2,
		inputItems: new Bank({ Dragonstone: 1 }),
		tickRate: 5,
		outputMultiple: 12
	},
	{
		name: 'Onyx bolt tips',
		id: itemID('Onyx bolt tips'),
		level: 73,
		xp: 9.4,
		inputItems: new Bank({ Onyx: 1 }),
		tickRate: 5,
		outputMultiple: 12
	}
];

export default Tips;
