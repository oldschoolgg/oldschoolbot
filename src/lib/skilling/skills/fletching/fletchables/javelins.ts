import itemID from '../../../../util/itemID';
import { Fletchable } from '../../../types';
import { transformStringBankToNum } from '../../../../util/transformStringBankToNum';

const Javelins: Fletchable[] = [
	{
		name: 'Bronze javelin',
		id: itemID('Bronze javelin'),
		level: 3,
		xp: 1,
		inputItems: transformStringBankToNum({ 'Bronze javelin heads': 1, 'Javelin shaft': 1 }),
		tickRate: 0.13
	},
	{
		name: 'Iron javelin',
		id: itemID('Iron javelin'),
		level: 17,
		xp: 2,
		inputItems: transformStringBankToNum({ 'Iron javelin heads': 1, 'Javelin shaft': 1 }),
		tickRate: 0.13
	},
	{
		name: 'Steel javelin',
		id: itemID('Steel javelin'),
		level: 32,
		xp: 5,
		inputItems: transformStringBankToNum({ 'Steel javelin heads': 1, 'Javelin shaft': 1 }),
		tickRate: 0.13
	},
	{
		name: 'Mithril javelin',
		id: itemID('Mithril javelin'),
		level: 47,
		xp: 8,
		inputItems: transformStringBankToNum({ 'Mithril javelin heads': 1, 'Javelin shaft': 1 }),
		tickRate: 0.13
	},
	{
		name: 'Adamant javelin',
		id: itemID('Adamant javelin'),
		level: 62,
		xp: 10,
		inputItems: transformStringBankToNum({ 'Adamant javelin heads': 1, 'Javelin shaft': 1 }),
		tickRate: 0.13
	},
	{
		name: 'Rune javelin',
		id: itemID('Rune javelin'),
		level: 77,
		xp: 12.4,
		inputItems: transformStringBankToNum({ 'Rune javelin heads': 1, 'Javelin shaft': 1 }),
		tickRate: 0.13
	},
	{
		name: 'Amethyst javelin',
		id: itemID('Amethyst javelin'),
		level: 84,
		xp: 13.5,
		inputItems: transformStringBankToNum({ 'Amethyst javelin heads': 1, 'Javelin shaft': 1 }),
		tickRate: 0.13
	},
	{
		name: 'Dragon javelin',
		id: itemID('Dragon javelin'),
		level: 92,
		xp: 15,
		inputItems: transformStringBankToNum({ 'Dragon javelin heads': 1, 'Javelin shaft': 1 }),
		tickRate: 0.13
	}
];

export default Javelins;
