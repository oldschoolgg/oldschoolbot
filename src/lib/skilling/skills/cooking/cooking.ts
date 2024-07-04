import { Emoji } from '../../../constants';
import itemID from '../../../util/itemID';
import type { Cookable } from '../../types';
import { SkillsEnum } from '../../types';

export const Cookables: Cookable[] = [
	{
		level: 1,
		xp: 30,
		id: itemID('Cooked meat'),
		name: 'Beef',
		inputCookables: { [itemID('Raw beef')]: 1 },
		stopBurnAt: 34,
		burnKourendBonus: [31, 31, 31, 31],
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
		burnKourendBonus: [31, 31, 31, 31],
		burntCookable: itemID('Burnt shrimp')
	},
	{
		level: 1,
		xp: 30,
		id: itemID('Cooked chicken'),
		name: 'Chicken',
		inputCookables: { [itemID('Raw chicken')]: 1 },
		stopBurnAt: 34,
		burnKourendBonus: [31, 31, 31, 31],
		burntCookable: itemID('Burnt chicken')
	},
	{
		level: 1,
		xp: 30,
		id: itemID('Anchovies'),
		name: 'Anchovies',
		inputCookables: { [itemID('Raw anchovies')]: 1 },
		stopBurnAt: 34,
		burnKourendBonus: [31, 31, 31, 31],
		burntCookable: 323
	},
	{
		level: 1,
		xp: 40,
		id: itemID('Sardine'),
		name: 'Sardine',
		inputCookables: { [itemID('Raw sardine')]: 1 },
		stopBurnAt: 38,
		burnKourendBonus: [34, 34, 34, 34],
		burntCookable: 369
	},
	{
		level: 5,
		xp: 50,
		id: itemID('Herring'),
		name: 'Herring',
		inputCookables: { [itemID('Raw herring')]: 1 },
		stopBurnAt: 41,
		burnKourendBonus: [38, 38, 38, 38],
		burntCookable: 357
	},
	{
		level: 10,
		xp: 60,
		id: itemID('Mackerel'),
		name: 'Mackerel',
		inputCookables: { [itemID('Raw mackerel')]: 1 },
		stopBurnAt: 45,
		burnKourendBonus: [42, 42, 42, 42],
		burntCookable: 357
	},
	{
		level: 15,
		xp: 70,
		id: itemID('Trout'),
		name: 'Trout',
		inputCookables: { [itemID('Raw trout')]: 1 },
		stopBurnAt: 49,
		burnKourendBonus: [46, 46, 46, 46],
		burntCookable: 343
	},
	{
		level: 18,
		xp: 75,
		id: itemID('Cod'),
		name: 'Cod',
		inputCookables: { [itemID('Raw cod')]: 1 },
		stopBurnAt: 51,
		burnKourendBonus: [46, 46, 46, 46],
		burntCookable: 343
	},
	{
		level: 20,
		xp: 80,
		id: itemID('Pike'),
		name: 'Pike',
		inputCookables: { [itemID('Raw pike')]: 1 },
		stopBurnAt: 54,
		burnKourendBonus: [50, 50, 50, 50],
		burntCookable: 343
	},
	{
		level: 25,
		xp: 90,
		id: itemID('Salmon'),
		name: 'Salmon',
		inputCookables: { [itemID('Raw salmon')]: 1 },
		stopBurnAt: 58,
		burnKourendBonus: [55, 55, 55, 55],
		burntCookable: 343
	},
	{
		level: 30,
		xp: 100,
		id: itemID('Tuna'),
		name: 'Tuna',
		inputCookables: { [itemID('Raw tuna')]: 1 },
		stopBurnAt: 63,
		burnKourendBonus: [59, 59, 59, 59],
		burntCookable: 367
	},
	{
		level: 30,
		xp: 190,
		id: itemID('Cooked karambwan'),
		name: 'Cooked karambwan',
		alias: ['karambwan'],
		inputCookables: { [itemID('Raw karambwan')]: 1 },
		stopBurnAt: 99,
		burnKourendBonus: [93, 87, 93, 87],
		burntCookable: itemID('Burnt karambwan')
	},
	{
		level: 35,
		xp: 200,
		id: itemID('Jug of wine'),
		name: 'Jug of wine',
		alias: ['wine'],
		inputCookables: { [itemID('Grapes')]: 1, [itemID('Jug of water')]: 1 },
		stopBurnAt: 68,
		burntCookable: itemID('Jug of bad wine')
	},
	{
		level: 38,
		xp: 115,
		id: itemID('Cave eel'),
		name: 'Cave eel',
		inputCookables: { [itemID('Raw cave eel')]: 1 },
		stopBurnAt: 74,
		burnKourendBonus: [70, 70, 70, 70],
		burntCookable: itemID('Burnt cave eel')
	},
	{
		level: 40,
		xp: 120,
		id: itemID('Lobster'),
		name: 'Lobster',
		alias: ['lob'],
		inputCookables: { [itemID('Raw lobster')]: 1 },
		stopBurnAt: 74,
		stopBurnAtCG: 64,
		burnKourendBonus: [70, 70, 61, 61],
		burntCookable: itemID('Burnt lobster')
	},
	{
		level: 41,
		xp: 160,
		id: itemID('Cooked jubbly'),
		name: 'Jubbly',
		alias: ['Jubbly', 'cooked jubbly'],
		inputCookables: { [itemID('Raw jubbly')]: 1 },
		stopBurnAt: 99,
		burntCookable: itemID('Burnt jubbly')
	},
	{
		level: 43,
		xp: 130,
		id: itemID('Bass'),
		name: 'Bass',
		inputCookables: { [itemID('Raw bass')]: 1 },
		stopBurnAt: 80,
		burnKourendBonus: [75, 75, 75, 75],
		burntCookable: 367
	},
	{
		level: 45,
		xp: 140,
		id: itemID('Swordfish'),
		name: 'Swordfish',
		alias: ['sword'],
		inputCookables: { [itemID('Raw swordfish')]: 1 },
		stopBurnAt: 86,
		stopBurnAtCG: 81,
		burnKourendBonus: [76, 76, 76, 76],
		burntCookable: itemID('Burnt swordfish')
	},
	{
		level: 62,
		xp: 150,
		id: itemID('Monkfish'),
		name: 'Monkfish',
		alias: ['monk'],
		inputCookables: { [itemID('Raw monkfish')]: 1 },
		stopBurnAt: 90,
		stopBurnAtCG: 87,
		burnKourendBonus: [86, 82, 82, 82],
		burntCookable: itemID('Burnt monkfish')
	},
	{
		level: 65,
		xp: 200,
		id: itemID('Wine of zamorak'),
		name: 'Wine of zamorak',
		alias: ['zammy wine'],
		inputCookables: { [itemID("Zamorak's grapes")]: 1, [itemID('Jug of water')]: 1 },
		stopBurnAt: 98,
		burntCookable: itemID('Jug of bad wine')
	},
	{
		level: 80,
		xp: 210,
		id: itemID('Shark'),
		name: 'Shark',
		inputCookables: { [itemID('Raw shark')]: 1 },
		stopBurnAt: 99,
		stopBurnAtCG: 94,
		burnKourendBonus: [99, 99, 89, 84],
		burntCookable: itemID('Burnt shark')
	},
	{
		level: 82,
		xp: 211.3,
		id: itemID('Sea turtle'),
		name: 'Sea turtle',
		alias: ['sea', 'turtle'],
		inputCookables: { [itemID('Raw sea turtle')]: 1 },
		stopBurnAt: 99,
		burntCookable: itemID('Burnt sea turtle')
	},
	{
		level: 84,
		xp: 230,
		id: itemID('Anglerfish'),
		name: 'Anglerfish',
		alias: ['angler'],
		inputCookables: { [itemID('Raw anglerfish')]: 1 },
		stopBurnAt: 99,
		stopBurnAtCG: 98,
		burnKourendBonus: [99, 99, 93, 88],
		burntCookable: itemID('Burnt anglerfish')
	},
	{
		level: 90,
		xp: 215,
		id: itemID('Dark crab'),
		name: 'Dark crab',
		alias: ['dark', 'crab'],
		inputCookables: { [itemID('Raw dark crab')]: 1 },
		stopBurnAt: 99,
		burntCookable: itemID('Burnt dark crab')
	},
	{
		level: 91,
		xp: 216.3,
		id: itemID('Manta ray'),
		name: 'Manta ray',
		alias: ['manta'],
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
