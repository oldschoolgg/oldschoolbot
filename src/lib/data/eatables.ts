import type { GearBank } from '../structures/GearBank';
import itemID from '../util/itemID';

interface Eatable {
	name: string;
	id: number;
	healAmount: ((user: GearBank) => number) | number;
	pvmBoost?: number;
	wildyOnly?: boolean;
}

export const Eatables: readonly Eatable[] = [
	{
		name: 'Anchovies',
		id: itemID('Anchovies'),
		healAmount: 1
	},
	{
		name: 'Shrimps',
		id: itemID('Shrimps'),
		healAmount: 3
	},
	{
		name: 'Cooked chicken',
		id: itemID('Cooked chicken'),
		healAmount: 3
	},
	{
		name: 'Cooked meat',
		id: itemID('Cooked meat'),
		healAmount: 3
	},
	{
		name: 'Sardine',
		id: itemID('Sardine'),
		healAmount: 4
	},
	{
		name: 'Bread',
		id: itemID('Bread'),
		healAmount: 5
	},
	{
		name: 'Herring',
		id: itemID('Herring'),
		healAmount: 5
	},
	{
		name: 'Mackerel',
		id: itemID('Mackerel'),
		healAmount: 6
	},
	{
		name: 'Trout',
		id: itemID('Trout'),
		healAmount: 7
	},
	{
		name: 'Cod',
		id: itemID('Cod'),
		healAmount: 7
	},
	{
		name: 'Pike',
		id: itemID('Pike'),
		healAmount: 8
	},
	{
		name: 'Salmon',
		id: itemID('Salmon'),
		healAmount: 9
	},
	{
		name: 'Tuna',
		id: itemID('Tuna'),
		healAmount: 10
	},
	{
		name: 'Jug of wine',
		id: itemID('Jug of wine'),
		healAmount: 11,
		pvmBoost: -10
	},
	{
		name: 'Stew',
		id: itemID('Stew'),
		healAmount: 11
	},
	{
		name: 'Cake',
		id: itemID('Cake'),
		healAmount: 12
	},
	{
		name: 'Lobster',
		id: itemID('Lobster'),
		healAmount: 12
	},
	{
		name: 'Bass',
		id: itemID('Bass'),
		healAmount: 13
	},
	{
		name: 'Plain pizza',
		id: itemID('Plain pizza'),
		healAmount: 14
	},
	{
		name: 'Swordfish',
		id: itemID('Swordfish'),
		healAmount: 14
	},
	{
		name: 'Potato with butter',
		id: itemID('Potato with butter'),
		healAmount: 14
	},
	{
		name: 'Chilli potato',
		id: itemID('Chilli potato'),
		healAmount: 14
	},
	{
		name: 'Chocolate cake',
		id: itemID('Chocolate cake'),
		healAmount: 15
	},
	{
		name: 'Egg potato',
		id: itemID('Egg potato'),
		healAmount: 16
	},
	{
		name: 'Potato with cheese',
		id: itemID('Potato with cheese'),
		healAmount: 16
	},
	{
		name: 'Meat pizza',
		id: itemID('Meat pizza'),
		healAmount: 16
	},
	{
		name: 'Monkfish',
		id: itemID('Monkfish'),
		healAmount: 16,
		pvmBoost: 1
	},
	{
		name: 'Anchovy pizza',
		id: itemID('Anchovy pizza'),
		healAmount: 18
	},
	{
		name: 'Cooked karambwan',
		id: itemID('Cooked karambwan'),
		healAmount: 18
	},
	{
		name: 'Blighted karambwan',
		id: itemID('Blighted karambwan'),
		healAmount: 18,
		wildyOnly: true
	},
	{
		name: 'Curry',
		id: itemID('Curry'),
		healAmount: 19
	},
	{
		name: 'Ugthanki kebab',
		id: itemID('Ugthanki kebab'),
		healAmount: 19
	},
	{
		name: 'Mushroom potato',
		id: itemID('Mushroom potato'),
		healAmount: 20
	},
	{
		name: 'Shark',
		id: itemID('Shark'),
		healAmount: 20,
		pvmBoost: 2
	},
	{
		name: 'Sea turtle',
		id: itemID('Sea turtle'),
		healAmount: 21,
		pvmBoost: 2
	},
	{
		name: 'Pineapple pizza',
		id: itemID('Pineapple pizza'),
		healAmount: 22
	},
	{
		name: 'Summer pie',
		id: itemID('Summer pie'),
		healAmount: 22
	},
	{
		name: 'Manta ray',
		id: itemID('Manta ray'),
		healAmount: 22,
		pvmBoost: 3
	},
	{
		name: 'Blighted manta ray',
		id: itemID('Blighted manta ray'),
		healAmount: 22,
		pvmBoost: 3,
		wildyOnly: true
	},
	{
		name: 'Tuna potato',
		id: itemID('Tuna potato'),
		healAmount: 22
	},
	{
		name: 'Dark crab',
		id: itemID('Dark crab'),
		healAmount: 22,
		pvmBoost: 3
	},
	{
		name: 'Anglerfish',
		id: itemID('Anglerfish'),
		healAmount: (user: GearBank) => {
			const hp = user.skillsAsLevels.hitpoints;
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
		healAmount: (user: GearBank) => {
			const hp = user.skillsAsLevels.hitpoints;
			let c = 2;
			if (hp > 10) c = 2;
			if (hp > 25) c = 4;
			if (hp > 50) c = 6;
			if (hp > 75) c = 8;
			if (hp > 93) c = 13;

			return hp * (1 / 10) + c;
		},
		pvmBoost: 4,
		wildyOnly: true
	}
];
