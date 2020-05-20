import itemID from '../../../../util/itemID';
import { Fletchable } from '../../../types';

const TippedBolts: Fletchable[] = [
	{
		name: 'Opal bolts',
		id: itemID('Opal bolts'),
		level: 11,
		xp: 1.6,
		inputItems: { [itemID('Opal bolt tips')]: 1, [itemID('Bronze bolts')]: 1 },
		tickRate: 0.2
	},
	{
		name: 'Pearl bolts',
		id: itemID('Pearl bolts'),
		level: 41,
		xp: 3.2,
		inputItems: { [itemID('Pearl bolt tips')]: 1, [itemID('Iron bolts')]: 1 },
		tickRate: 0.2
	},
	{
		name: 'Topaz bolts',
		id: itemID('Topaz bolts'),
		level: 48,
		xp: 4,
		inputItems: { [itemID('Topaz bolt tips')]: 1, [itemID('Steel bolts')]: 1 },
		tickRate: 0.2
	},
	{
		name: 'Sapphire bolts',
		id: itemID('Sapphire bolts'),
		level: 56,
		xp: 4.7,
		inputItems: { [itemID('Sapphire bolt tips')]: 1, [itemID('Mithril bolts')]: 1 },
		tickRate: 0.2
	},
	{
		name: 'Emerald bolts',
		id: itemID('Emerald bolts'),
		level: 58,
		xp: 5.5,
		inputItems: { [itemID('Emerald bolt tips')]: 1, [itemID('Mithril bolts')]: 1 },
		tickRate: 0.2
	},
	{
		name: 'Ruby bolts',
		id: itemID('Ruby bolts'),
		level: 63,
		xp: 6.3,
		inputItems: { [itemID('Ruby bolt tips')]: 1, [itemID('Adamant bolts')]: 1 },
		tickRate: 0.2
	},
	{
		name: 'Diamond bolts',
		id: itemID('Diamond bolts'),
		level: 65,
		xp: 7,
		inputItems: { [itemID('Diamond bolt tips')]: 1, [itemID('Adamant bolts')]: 1 },
		tickRate: 0.2
	},
	{
		name: 'Dragonstone bolts',
		id: itemID('Dragonstone bolts'),
		level: 71,
		xp: 8.2,
		inputItems: { [itemID('Dragonstone bolt tips')]: 1, [itemID('Runite bolts')]: 1 },
		tickRate: 0.2
	},
	{
		name: 'Onyx bolts',
		id: itemID('Onyx bolts'),
		level: 73,
		xp: 9.4,
		inputItems: { [itemID('Onyx bolt tips')]: 1, [itemID('Runite bolts')]: 1 },
		tickRate: 0.2
	},
	{
		name: 'Amethyst broad bolts',
		id: itemID('Amethyst broad bolts'),
		level: 76,
		xp: 10.6,
		inputItems: { [itemID('Amethyst bolt tips')]: 1, [itemID('Broad bolts')]: 1 },
		tickRate: 0.2
	}
];

export default TippedBolts;
