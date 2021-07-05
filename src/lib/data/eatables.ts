import itemID from '../util/itemID';

export interface Eatable {
	name: string;
	id: number;
	healAmount: number;
	raw: number | null;
}

export const Eatables: Eatable[] = [
	{
		name: 'Trout',
		id: itemID('Trout'),
		healAmount: 7,
		raw: itemID('Raw trout')
	},
	{
		name: 'Cod',
		id: itemID('Cod'),
		healAmount: 7,
		raw: itemID('Raw cod')
	},
	{
		name: 'Pike',
		id: itemID('Pike'),
		healAmount: 8,
		raw: itemID('Raw pike')
	},
	{
		name: 'Salmon',
		id: itemID('Salmon'),
		healAmount: 9,
		raw: itemID('Raw salmon')
	},
	{
		name: 'Tuna',
		id: itemID('Tuna'),
		healAmount: 10,
		raw: itemID('Raw tuna')
	},
	{
		name: 'Jug of wine',
		id: itemID('Jug of wine'),
		healAmount: 11,
		raw: null
	},
	{
		name: 'Stew',
		id: itemID('Stew'),
		healAmount: 11,
		raw: null
	},
	{
		name: 'Cake',
		id: itemID('Cake'),
		healAmount: 12,
		raw: null
	},
	{
		name: 'Lobster',
		id: itemID('Lobster'),
		healAmount: 12,
		raw: itemID('Raw lobster')
	},
	{
		name: 'Bass',
		id: itemID('Bass'),
		healAmount: 13,
		raw: itemID('Raw bass')
	},
	{
		name: 'Plain pizza',
		id: itemID('Plain pizza'),
		healAmount: 14,
		raw: null
	},
	{
		name: 'Swordfish',
		id: itemID('Swordfish'),
		healAmount: 14,
		raw: itemID('Raw swordfish')
	},
	{
		name: 'Potato with butter',
		id: itemID('Potato with butter'),
		healAmount: 14,
		raw: null
	},
	{
		name: 'Chocolate cake',
		id: itemID('Chocolate cake'),
		healAmount: 15,
		raw: null
	},
	{
		name: 'Potato with cheese',
		id: itemID('Potato with cheese'),
		healAmount: 16,
		raw: null
	},
	{
		name: 'Meat pizza',
		id: itemID('Meat pizza'),
		healAmount: 16,
		raw: null
	},
	{
		name: 'Monkfish',
		id: itemID('Monkfish'),
		healAmount: 16,
		raw: itemID('Raw cod')
	},
	{
		name: 'Anchovy pizza',
		id: itemID('Anchovy pizza'),
		healAmount: 18,
		raw: null
	},
	{
		name: 'Cooked karambwan',
		id: itemID('Cooked karambwan'),
		healAmount: 18,
		raw: itemID('Raw karambwan')
	},
	{
		name: 'Curry',
		id: itemID('Curry'),
		healAmount: 19,
		raw: null
	},
	{
		name: 'Ugthanki kebab',
		id: itemID('Ugthanki kebab'),
		healAmount: 19,
		raw: null
	},
	{
		name: 'Mushroom potato',
		id: itemID('Mushroom potato'),
		healAmount: 20,
		raw: null
	},
	{
		name: 'Shark',
		id: itemID('Shark'),
		healAmount: 20,
		raw: itemID('Raw cod')
	},
	{
		name: 'Sea turtle',
		id: itemID('Sea turtle'),
		healAmount: 21,
		raw: itemID('Raw sea turtle')
	},
	{
		name: 'Pineapple pizza',
		id: itemID('Pineapple pizza'),
		healAmount: 22,
		raw: null
	},
	{
		name: 'Summer pie',
		id: itemID('Summer pie'),
		healAmount: 22,
		raw: null
	},
	{
		name: 'Manta ray',
		id: itemID('Manta ray'),
		healAmount: 22,
		raw: itemID('Raw manta ray')
	},
	{
		name: 'Tuna potato',
		id: itemID('Tuna potato'),
		healAmount: 22,
		raw: null
	},
	{
		name: 'Dark crab',
		id: itemID('Dark crab'),
		healAmount: 22,
		raw: itemID('Raw dark crab')
	},
	{
		name: 'Rocktail',
		id: itemID('Rocktail'),
		healAmount: 26,
		raw: itemID('Raw Rocktail')
	}
];
