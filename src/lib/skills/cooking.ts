import { SkillsEnum, Cookable } from '../types';
import itemID from '../util/itemID';
import { Emoji } from '../constants';

const cookables: Cookable[] = [
	{
		level: 1,
		xp: 30,
		id: itemID('Cooked meat'),
		name: 'Cooked meat',
		inputCookables: { [itemID('Raw meat')]: 1 },
		stopBurnAt: 31,
		stopBurnAtCG: 1
	},
	{
		level: 1,
		xp: 30,
		id: itemID('Shrimps'),
		name: 'Shrimps',
		inputCookables: { [itemID('Raw shrimps')]: 1 },
		stopBurnAt: 34,
		stopBurnAtCG: 1
	},
	{
		level: 1,
		xp: 30,
		id: itemID('Cooked chicken'),
		name: 'Cooked chicken',
		inputCookables: { [itemID('Raw chicken')]: 1 },
		stopBurnAt: 50,
		stopBurnAtCG: 1
	},
	{
		level: 1,
		xp: 30,
		id: itemID('Anchovies'),
		name: 'Anchovies',
		inputCookables: { [itemID('Raw anchovies')]: 1 },
		stopBurnAt: 34,
		stopBurnAtCG: 1
	},
	{
		level: 1,
		xp: 40,
		id: itemID('Sardine'),
		name: 'Sardine',
		inputCookables: { [itemID('Raw sardine')]: 1 },
		stopBurnAt: 37,
		stopBurnAtCG: 1
	},
	{
		level: 5,
		xp: 50,
		id: itemID('Herring'),
		name: 'Herring',
		inputCookables: { [itemID('Raw herring')]: 1 },
		stopBurnAt: 41,
		stopBurnAtCG: 1
	},
	{
		level: 10,
		xp: 60,
		id: itemID('Mackerel'),
		name: 'Mackerel',
		inputCookables: { [itemID('Raw mackerel')]: 1 },
		stopBurnAt: 45,
		stopBurnAtCG: 1
	},
	{
		level: 15,
		xp: 70,
		id: itemID('Trout'),
		name: 'Trout',
		inputCookables: { [itemID('Raw trout')]: 1 },
		stopBurnAt: 49,
		stopBurnAtCG: 1
	},
	{
		level: 18,
		xp: 75,
		id: itemID('Cod'),
		name: 'Cod',
		inputCookables: { [itemID('Raw cod')]: 1 },
		stopBurnAt: 52,
		stopBurnAtCG: 1
	},
	{
		level: 20,
		xp: 80,
		id: itemID('Pike'),
		name: 'Pike',
		inputCookables: { [itemID('Raw pike')]: 1 },
		stopBurnAt: 64,
		stopBurnAtCG: 1
	},
	{
		level: 25,
		xp: 90,
		id: itemID('Salmon'),
		name: 'Salmon',
		inputCookables: { [itemID('Raw salmon')]: 1 },
		stopBurnAt: 58,
		stopBurnAtCG: 1
	},
	{
		level: 30,
		xp: 100,
		id: itemID('Tuna'),
		name: 'Tune',
		inputCookables: { [itemID('Raw tuna')]: 1 },
		stopBurnAt: 63,
		stopBurnAtCG: 1
	},
	{
		level: 30,
		xp: 190,
		id: itemID('Cooked karambwan'),
		name: 'Cooked karambwan',
		inputCookables: { [itemID('Raw karambwan')]: 1 },
		stopBurnAt: 99,
		stopBurnAtCG: 1
	},
	{
		level: 35,
		xp: 200,
		id: itemID('Jug of wine'),
		name: 'Jug of wine',
		inputCookables: { [itemID('Grapes')]: 1, [itemID('Jug of wine')]: 1 },
		stopBurnAt: 68,
		stopBurnAtCG: 1
	},
	{
		level: 40,
		xp: 120,
		id: itemID('Lobster'),
		name: 'Lobster',
		inputCookables: { [itemID('Raw lobster')]: 1 },
		stopBurnAt: 74,
		stopBurnAtCG: 64
	},
	{
		level: 43,
		xp: 130,
		id: itemID('Bass'),
		name: 'Bass',
		inputCookables: { [itemID('Raw bass')]: 1 },
		stopBurnAt: 80,
		stopBurnAtCG: 1
	},
	{
		level: 45,
		xp: 140,
		id: itemID('Swordfish'),
		name: 'Swordfish',
		inputCookables: { [itemID('Raw swordfish')]: 1 },
		stopBurnAt: 86,
		stopBurnAtCG: 81
	},
	{
		level: 62,
		xp: 150,
		id: itemID('Monkfish'),
		name: 'Monkfish',
		inputCookables: { [itemID('Raw monkfish')]: 1 },
		stopBurnAt: 90,
		stopBurnAtCG: 88
	},
	{
		level: 80,
		xp: 210,
		id: itemID('Shark'),
		name: 'Shark',
		inputCookables: { [itemID('Raw shark')]: 1 },
		stopBurnAt: 99,
		stopBurnAtCG: 94
	},
	{
		level: 84,
		xp: 230,
		id: itemID('Anglerfish'),
		name: 'Anglerfish',
		inputCookables: { [itemID('Raw anglerfish')]: 1 },
		stopBurnAt: 99,
		stopBurnAtCG: 98
	},
	{
		level: 90,
		xp: 215,
		id: itemID('Dark crab'),
		name: 'Dark crab',
		inputCookables: { [itemID('Raw dark crab')]: 1 },
		stopBurnAt: 99,
		stopBurnAtCG: 1
	},
	{
		level: 91,
		xp: 216.2,
		id: itemID('Manta ray'),
		name: 'Manta ray',
		inputCookables: { [itemID('Raw manta ray')]: 1 },
		stopBurnAt: 99,
		stopBurnAtCG: 1
	}
];
const Cooking = {
	Cookables: cookables,
	id: SkillsEnum.Cooking,
	emoji: Emoji.Cooking
};

export default Cooking;
