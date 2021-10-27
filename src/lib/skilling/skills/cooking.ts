import { Emoji } from '../../constants';
import itemID from '../../util/itemID';
import { Cookable, SkillsEnum } from '../types';

export const Cookables: Cookable[] = [
	{
		level: 1,
		xp: 30,
		id: itemID('Cooked meat'),
		name: 'Beef',
		inputCookables: { [itemID('Raw beef')]: 1 },
		stopBurnAt: 31,
		burntCookable: itemID('Burnt meat')
	},
	{
		level: 1,
		xp: 3,
		id: itemID('Sinew'),
		name: 'Sinew',
		inputCookables: { [itemID('Raw beef')]: 1 },
		stopBurnAt: 1,
		burntCookable: itemID('Burnt meat')
	},
	{
		level: 1,
		xp: 30,
		id: itemID('Shrimps'),
		name: 'Shrimps',
		inputCookables: { [itemID('Raw shrimps')]: 1 },
		stopBurnAt: 34,
		burntCookable: itemID('Burnt shrimp')
	},
	{
		level: 1,
		xp: 30,
		id: itemID('Cooked chicken'),
		name: 'Chicken',
		inputCookables: { [itemID('Raw chicken')]: 1 },
		stopBurnAt: 34,
		burntCookable: itemID('Burnt chicken')
	},
	{
		level: 1,
		xp: 30,
		id: itemID('Anchovies'),
		name: 'Anchovies',
		inputCookables: { [itemID('Raw anchovies')]: 1 },
		stopBurnAt: 34,
		burntCookable: 323
	},
	{
		level: 1,
		xp: 40,
		id: itemID('Sardine'),
		name: 'Sardine',
		inputCookables: { [itemID('Raw sardine')]: 1 },
		stopBurnAt: 37,
		burntCookable: 369
	},
	{
		level: 5,
		xp: 50,
		id: itemID('Herring'),
		name: 'Herring',
		inputCookables: { [itemID('Raw herring')]: 1 },
		stopBurnAt: 41,
		burntCookable: 357
	},
	{
		level: 10,
		xp: 60,
		id: itemID('Mackerel'),
		name: 'Mackerel',
		inputCookables: { [itemID('Raw mackerel')]: 1 },
		stopBurnAt: 45,
		burntCookable: 357
	},
	{
		level: 15,
		xp: 70,
		id: itemID('Trout'),
		name: 'Trout',
		inputCookables: { [itemID('Raw trout')]: 1 },
		stopBurnAt: 49,
		burntCookable: 343
	},
	{
		level: 18,
		xp: 75,
		id: itemID('Cod'),
		name: 'Cod',
		inputCookables: { [itemID('Raw cod')]: 1 },
		stopBurnAt: 52,
		burntCookable: 343
	},
	{
		level: 20,
		xp: 80,
		id: itemID('Pike'),
		name: 'Pike',
		inputCookables: { [itemID('Raw pike')]: 1 },
		stopBurnAt: 64,
		burntCookable: 343
	},
	{
		level: 25,
		xp: 90,
		id: itemID('Salmon'),
		name: 'Salmon',
		inputCookables: { [itemID('Raw salmon')]: 1 },
		stopBurnAt: 58,
		burntCookable: 343
	},
	{
		level: 30,
		xp: 100,
		id: itemID('Tuna'),
		name: 'Tuna',
		inputCookables: { [itemID('Raw tuna')]: 1 },
		stopBurnAt: 63,
		burntCookable: 367
	},
	{
		level: 30,
		xp: 190,
		id: itemID('Cooked karambwan'),
		name: 'Karambwan',
		inputCookables: { [itemID('Raw karambwan')]: 1 },
		stopBurnAt: 99,
		burntCookable: itemID('Burnt karambwan')
	},
	{
		level: 35,
		xp: 200,
		id: itemID('Jug of wine'),
		name: 'Jug of wine',
		inputCookables: { [itemID('Grapes')]: 1, [itemID('Jug of water')]: 1 },
		stopBurnAt: 68,
		burntCookable: itemID('Jug of bad wine'),
		customTickRate: 1.8
	},
	{
		level: 35,
		xp: 0,
		id: itemID('Pizza base'),
		name: 'Pizza base',
		inputCookables: { [itemID('Pot of flour')]: 1, [itemID('Jug of water')]: 1 },
		stopBurnAt: 1,
		burntCookable: itemID('Burnt pizza'),
		customTickRate: 1.5
	},
	{
		level: 35,
		xp: 143,
		id: itemID('Plain Pizza'),
		name: 'Plain pizza',
		inputCookables: { [itemID('Pizza base')]: 1, [itemID('Cheese')]: 1, [itemID('Tomato')]: 1 },
		stopBurnAt: 68,
		burntCookable: itemID('Burnt pizza'),
		customTickRate: 6.66
	},
	{
		level: 40,
		xp: 120,
		id: itemID('Lobster'),
		name: 'Lobster',
		inputCookables: { [itemID('Raw lobster')]: 1 },
		stopBurnAt: 74,
		stopBurnAtCG: 64,
		burntCookable: itemID('Burnt lobster')
	},
	{
		level: 43,
		xp: 130,
		id: itemID('Bass'),
		name: 'Bass',
		inputCookables: { [itemID('Raw bass')]: 1 },
		stopBurnAt: 80,
		burntCookable: 367
	},
	{
		level: 45,
		xp: 140,
		id: itemID('Swordfish'),
		name: 'Swordfish',
		inputCookables: { [itemID('Raw swordfish')]: 1 },
		stopBurnAt: 86,
		stopBurnAtCG: 81,
		burntCookable: itemID('Burnt swordfish')
	},
	{
		level: 45,
		xp: 26,
		id: itemID('Meat Pizza'),
		name: 'Meat pizza',
		inputCookables: { [itemID('Plain pizza')]: 1, [itemID('Cooked meat')]: 1 },
		stopBurnAt: 1,
		burntCookable: itemID('Burnt pizza'),
		customTickRate: 1.44
	},
	{
		level: 45,
		xp: 26,
		id: itemID('Meat Pizza'),
		name: 'Chicken meat pizza',
		inputCookables: { [itemID('Plain pizza')]: 1, [itemID('Cooked Chicken')]: 1 },
		stopBurnAt: 1,
		burntCookable: itemID('Burnt pizza'),
		customTickRate: 1.44
	},
	{
		level: 65,
		xp: 39,
		id: itemID('Anchovy Pizza'),
		name: 'Anchovy pizza',
		inputCookables: { [itemID('Plain pizza')]: 1, [itemID('Anchovies')]: 1 },
		stopBurnAt: 1,
		burntCookable: itemID('Burnt pizza'),
		customTickRate: 1.44
	},
	{
		level: 62,
		xp: 150,
		id: itemID('Monkfish'),
		name: 'Monkfish',
		inputCookables: { [itemID('Raw monkfish')]: 1 },
		stopBurnAt: 90,
		stopBurnAtCG: 87,
		burntCookable: itemID('Burnt monkfish')
	},
	{
		level: 65,
		xp: 200,
		id: itemID('Wine of zamorak'),
		name: 'Wine of zamorak',
		inputCookables: { [itemID("Zamorak's grapes")]: 1, [itemID('Jug of water')]: 1 },
		stopBurnAt: 125,
		burntCookable: itemID('Jug of bad wine')
	},
	{
		level: 65,
		xp: 45,
		id: itemID('Pineapple Pizza'),
		name: 'Pineapple pizza',
		inputCookables: { [itemID('Plain pizza')]: 1, [itemID('Pineapple ring')]: 1 },
		stopBurnAt: 1,
		burntCookable: itemID('Burnt pizza'),
		customTickRate: 1.44
	},
	{
		level: 80,
		xp: 210,
		id: itemID('Shark'),
		name: 'Shark',
		inputCookables: { [itemID('Raw shark')]: 1 },
		stopBurnAt: 99,
		stopBurnAtCG: 94,
		burntCookable: itemID('Burnt shark')
	},
	{
		level: 82,
		xp: 211,
		id: itemID('Sea turtle'),
		name: 'Sea turtle',
		inputCookables: { [itemID('Raw sea turtle')]: 1 },
		stopBurnAt: 99,
		burntCookable: itemID('Burnt sea turtle')
	},
	{
		level: 84,
		xp: 230,
		id: itemID('Anglerfish'),
		name: 'Anglerfish',
		inputCookables: { [itemID('Raw anglerfish')]: 1 },
		stopBurnAt: 99,
		stopBurnAtCG: 98,
		burntCookable: itemID('Burnt anglerfish')
	},
	{
		level: 90,
		xp: 215,
		id: itemID('Dark crab'),
		name: 'Dark crab',
		inputCookables: { [itemID('Raw dark crab')]: 1 },
		stopBurnAt: 99,
		stopBurnAtCG: 1,
		burntCookable: itemID('Burnt dark crab')
	},
	{
		level: 91,
		xp: 216.2,
		id: itemID('Manta ray'),
		name: 'Manta ray',
		inputCookables: { [itemID('Raw manta ray')]: 1 },
		stopBurnAt: 99,
		burntCookable: itemID('Burnt manta ray')
	}
];

const Cooking = {
	aliases: ['cooking', 'cook'],
	Cookables,
	id: SkillsEnum.Cooking,
	emoji: Emoji.Cooking,
	name: 'Cooking'
};

export default Cooking;
