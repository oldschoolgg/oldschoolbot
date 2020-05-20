import itemID from '../../../../util/itemID';
import { Fletchable } from '../../../types';

const Javelins: Fletchable[] = [
	{
		name: 'Bronze javelin',
		id: itemID('Bronze javelin'),
		level: 3,
		xp: 1,
		inputItems: { [itemID('Bronze javelin heads')]: 1, [itemID('Javelin shaft')]: 1 },
		tickRate: 0.07
	},
	{
		name: 'Iron javelin',
		id: itemID('Iron javelin'),
		level: 17,
		xp: 2,
		inputItems: { [itemID('Iron javelin heads')]: 1, [itemID('Javelin shaft')]: 1 },
		tickRate: 0.07
	},
	{
		name: 'Steel javelin',
		id: itemID('Steel javelin'),
		level: 32,
		xp: 5,
		inputItems: { [itemID('Steel javelin heads')]: 1, [itemID('Javelin shaft')]: 1 },
		tickRate: 0.07
	},
	{
		name: 'Mithril javelin',
		id: itemID('Mithril javelin'),
		level: 47,
		xp: 8,
		inputItems: { [itemID('Mithril javelin heads')]: 1, [itemID('Javelin shaft')]: 1 },
		tickRate: 0.07
	},
	{
		name: 'Adamant javelin',
		id: itemID('Adamant javelin'),
		level: 62,
		xp: 10,
		inputItems: { [itemID('Adamant javelin heads')]: 1, [itemID('Javelin shaft')]: 1 },
		tickRate: 0.07
	},
	{
		name: 'Rune javelin',
		id: itemID('Rune javelin'),
		level: 77,
		xp: 12.4,
		inputItems: { [itemID('Rune javelin heads')]: 1, [itemID('Javelin shaft')]: 1 },
		tickRate: 0.07
	},
	{
		name: 'Amethyst javelin',
		id: itemID('Amethyst javelin'),
		level: 84,
		xp: 13.5,
		inputItems: { [itemID('Amethyst javelin heads')]: 1, [itemID('Javelin shaft')]: 1 },
		tickRate: 0.07
	},
	{
		name: 'Dragon javelin',
		id: itemID('Dragon javelin'),
		level: 92,
		xp: 15,
		inputItems: { [itemID('Dragon javelin heads')]: 1, [itemID('Javelin shaft')]: 1 },
		tickRate: 0.07
	}
];

export default Javelins;
