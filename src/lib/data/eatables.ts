import itemID from '../util/itemID';

interface Eatable {
	name: string;
	id: number;
	raw: number | null;
	healAmount: ((user: MUser) => number) | number;
	pvmBoost?: number;
	wildyOnly?: boolean;
}

export const Eatables: readonly Eatable[] = [
	{
		name: 'Anchovies',
		id: itemID('Anchovies'),
		healAmount: 1,
		raw: null
	},
	{
		name: 'Shrimps',
		id: itemID('Shrimps'),
		healAmount: 3,
		raw: null
	},
	{
		name: 'Cooked chicken',
		id: itemID('Cooked chicken'),
		healAmount: 3,
		raw: null
	},
	{
		name: 'Cooked meat',
		id: itemID('Cooked meat'),
		healAmount: 3,
		raw: null
	},
	{
		name: 'Sardine',
		id: itemID('Sardine'),
		healAmount: 4,
		raw: itemID('Raw sardine')
	},
	{
		name: 'Bread',
		id: itemID('Bread'),
		healAmount: 5,
		raw: null
	},
	{
		name: 'Herring',
		id: itemID('Herring'),
		healAmount: 5,
		raw: itemID('Raw herring')
	},
	{
		name: 'Mackerel',
		id: itemID('Mackerel'),
		healAmount: 6,
		raw: itemID('Raw mackerel')
	},
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
		raw: null,
		pvmBoost: -10
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
		name: 'Chilli potato',
		id: itemID('Chilli potato'),
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
		name: 'Egg potato',
		id: itemID('Egg potato'),
		healAmount: 16,
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
		raw: itemID('Raw monkfish'),
		pvmBoost: 1
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
		name: 'Blighted karambwan',
		id: itemID('Blighted karambwan'),
		healAmount: 18,
		raw: null,
		wildyOnly: true
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
		raw: itemID('Raw shark'),
		pvmBoost: 2
	},
	{
		name: 'Sea turtle',
		id: itemID('Sea turtle'),
		healAmount: 21,
		raw: itemID('Raw sea turtle'),
		pvmBoost: 2
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
		raw: itemID('Raw manta ray'),
		pvmBoost: 3
	},
	{
		name: 'Blighted manta ray',
		id: itemID('Blighted manta ray'),
		healAmount: 22,
		raw: null,
		pvmBoost: 3,
		wildyOnly: true
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
		raw: itemID('Raw dark crab'),
		pvmBoost: 3
	},
	{
		name: 'Anglerfish',
		id: itemID('Anglerfish'),
		raw: itemID('Raw anglerfish'),
		healAmount: (user: MUser) => {
			const hp = user.skillLevel('hitpoints');
			let c = 2;
			if (hp > 10) c = 2;
			if (hp > 25) c = 4;
			if (hp > 50) c = 6;
			if (hp > 75) c = 8;
			if (hp > 93) c = 13;

			return hp * (1 / 10) + c;
		},
		pvmBoost: 4
	},
	{
		name: 'Blighted anglerfish',
		id: itemID('Blighted anglerfish'),
		healAmount: (user: MUser) => {
			const hp = user.skillLevel('hitpoints');
			let c = 2;
			if (hp > 10) c = 2;
			if (hp > 25) c = 4;
			if (hp > 50) c = 6;
			if (hp > 75) c = 8;
			if (hp > 93) c = 13;

			return hp * (1 / 10) + c;
		},
		raw: null,
		pvmBoost: 4,
		wildyOnly: true
	},
	{
		name: 'Rocktail',
		id: itemID('Rocktail'),
		healAmount: 26,
		raw: itemID('Raw Rocktail'),
		pvmBoost: 7
	},
	{
		name: 'Raw yeti meat',
		id: itemID('Raw yeti meat'),
		healAmount: 26,
		raw: itemID('Raw yeti meat'),
		pvmBoost: 8
	}
];
