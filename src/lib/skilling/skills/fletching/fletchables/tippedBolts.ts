import { Bank } from 'oldschooljs';

import itemID from '../../../../util/itemID';
import type { Fletchable } from '../../../types';

const TippedBolts: Fletchable[] = [
	{
		name: 'Opal bolts',
		id: itemID('Opal bolts'),
		level: 11,
		xp: 1.6,
		inputItems: new Bank({ 'Opal bolt tips': 1, 'Bronze bolts': 1 }),
		tickRate: 0.2
	},
	{
		name: 'Pearl bolts',
		id: itemID('Pearl bolts'),
		level: 41,
		xp: 3.2,
		inputItems: new Bank({ 'Pearl bolt tips': 1, 'Iron bolts': 1 }),
		tickRate: 0.2
	},
	{
		name: 'Topaz bolts',
		id: itemID('Topaz bolts'),
		level: 48,
		xp: 4,
		inputItems: new Bank({ 'Topaz bolt tips': 1, 'Steel bolts': 1 }),
		tickRate: 0.2
	},
	{
		name: 'Sapphire bolts',
		id: itemID('Sapphire bolts'),
		level: 56,
		xp: 4.7,
		inputItems: new Bank({ 'Sapphire bolt tips': 1, 'Mithril bolts': 1 }),
		tickRate: 0.2
	},
	{
		name: 'Emerald bolts',
		id: itemID('Emerald bolts'),
		level: 58,
		xp: 5.5,
		inputItems: new Bank({ 'Emerald bolt tips': 1, 'Mithril bolts': 1 }),
		tickRate: 0.2
	},
	{
		name: 'Ruby bolts',
		id: itemID('Ruby bolts'),
		level: 63,
		xp: 6.3,
		inputItems: new Bank({ 'Ruby bolt tips': 1, 'Adamant bolts': 1 }),
		tickRate: 0.2
	},
	{
		name: 'Diamond bolts',
		id: itemID('Diamond bolts'),
		level: 65,
		xp: 7,
		inputItems: new Bank({ 'Diamond bolt tips': 1, 'Adamant bolts': 1 }),
		tickRate: 0.2
	},
	{
		name: 'Dragonstone bolts',
		id: itemID('Dragonstone bolts'),
		level: 71,
		xp: 8.2,
		inputItems: new Bank({ 'Dragonstone bolt tips': 1, 'Runite bolts': 1 }),
		tickRate: 0.2
	},
	{
		name: 'Onyx bolts',
		id: itemID('Onyx bolts'),
		level: 73,
		xp: 9.4,
		inputItems: new Bank({ 'Onyx bolt tips': 1, 'Runite bolts': 1 }),
		tickRate: 0.2
	}
];

export default TippedBolts;
