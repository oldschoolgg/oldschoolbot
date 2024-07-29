import { writeFileSync } from 'node:fs';
import { getItem } from '../util';
import itemID from '../util/itemID';

export interface Eatable {
	name: string;
	id: number;
	raw: number | null;
	healAmount: ((user: MUser) => number) | number;
	pvmBoost?: number;
	wildyOnly?: boolean;
}
export const Eatables: Eatable[] = [
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

const others = [
	['Cup of tea', 3],
	['Bruised banana', 0],
	['Jangerberries', 2],
	['Giant carp', 6],
	['Edible seaweed', 4],
	['Karamjan rum', 5],
	['Cup of tea (nettle)', 3],
	['Ugthanki meat', 3],
	['Chopped tomato', 2],
	['Chopped onion', 1],
	['Onion & tomato', 3],
	['Ugthanki kebab (smelling)', 0],
	['Asgarnian ale', 1],
	["Wizard's mind bomb", 1],
	["Greenman's ale", 1],
	['Dragon bitter', 1],
	['Dwarven stout', 1],
	['Grog', 3],
	['Beer', 1],
	['Potato', 1],
	['Onion', 1],
	['Pumpkin', 14],
	['Easter egg', 14],
	['Banana', 2],
	['Cabbage', 1],
	['Spinach roll', 2],
	['Chocolate bar', 3],
	['Chocolatey milk', 4],
	['Tomato', 2],
	['Cheese', 2],
	['Half full wine jug', 7],
	['Vodka', 5],
	['Whisky', 5],
	['Gin', 5],
	['Brandy', 5],
	["Premade blurb' sp.", 7],
	["Premade choc s'dy", 5],
	["Premade dr' dragon", 5],
	["Premade fr' blast", 9],
	["Premade p' punch", 9],
	['Premade sgg', 5],
	["Premade wiz blz'd", 5],
	['Pineapple punch', 9],
	['Wizard blizzard', 5],
	['Blurberry special', 7],
	['Choc saturday', 5],
	['Short green guy', 5],
	['Fruit blast', 9],
	['Drunk dragon', 5],
	['Lemon', 2],
	['Lemon chunks', 2],
	['Lemon slices', 2],
	['Orange', 2],
	['Orange chunks', 2],
	['Orange slices', 2],
	['Pineapple chunks', 2],
	['Pineapple ring', 2],
	['Lime', 2],
	['Lime chunks', 2],
	['Lime slices', 2],
	['Dwellberries', 2],
	['Equa leaves', 1],
	['Pot of cream', 1],
	['Lava eel', 11],
	["Toad's legs", 3],
	['King worm', 2],
	['Chocolate bomb', 15],
	["Tangled toad's legs", 15],
	['Worm hole', 12],
	['Veg ball', 12],
	['Worm crunchies', 8],
	['Chocchip crunchies', 7],
	['Spicy crunchies', 7],
	['Toad crunchies', 8],
	["Premade w'm batta", 11],
	["Premade t'd batta", 11],
	['Premade c+t batta', 11],
	["Premade fr't batta", 11],
	['Premade veg batta', 11],
	['Premade choc bomb', 15],
	['Premade ttl', 15],
	['Premade worm hole', 12],
	['Premade veg ball', 12],
	["Premade w'm crun'", 8],
	["Premade ch' crunch", 8],
	["Premade s'y crunch", 7],
	["Premade t'd crunch", 8],
	['Worm batta', 11],
	['Toad batta', 11],
	['Cheese+tom batta', 11],
	['Fruit batta', 11],
	['Vegetable batta', 11],
	['Cooked oomlie wrap', 14],
	['Cooked chompy', 11],
	['Moonlight mead', 4],
	['Sliced banana', 2],
	['Cooked rabbit', 5],
	['Keg of beer', 15],
	['Beer tankard', 4],
	['Monkey nuts', 4],
	['Monkey bar', 5],
	['Banana stew', 11],
	['Nettle-water', 1],
	['Nettle tea', 3],
	['White pearl', 2],
	['Giant frog legs', 6],
	["Bandit's brew", 1],
	['Asgarnian ale(m)', 2],
	['Mature wmb', 2],
	["Greenman's ale(m)", 2],
	['Dragon bitter(m)', 2],
	['Dwarven stout(m)', 2],
	['Moonlight mead(m)', 6],
	["Axeman's folly", 1],
	["Axeman's folly(m)", 2],
	["Chef's delight", 1],
	["Chef's delight(m)", 2],
	["Slayer's respite", 1],
	["Slayer's respite(m)", 2],
	['Cider', 1],
	['Mature cider', 2],
	['Dwarven stout', 1],
	['Papaya fruit', 8],
	['Gout tuber', 12],
	['White tree fruit', 3],
	['Baked potato', 4],
	['Choc-ice', 7],
	['Peach', 8],
	['Baguette', 6],
	['Triangle sandwich', 6],
	['Roll', 6],
	['Square sandwich', 6],
	['Chilli con carne', 5],
	['Egg and tomato', 8],
	['Mushroom & onion', 11],
	['Tuna and corn', 13],
	['Minced meat', 13],
	['Spicy sauce', 2],
	['Scrambled egg', 2],
	['Fried mushrooms', 5],
	['Fried onions', 5],
	['Chopped tuna', 10],
	["Braindeath 'rum'", 14],
	['Roast rabbit', 7],
	['Spicy stew', 0],
	['Cooked fishcake', 11],
	['Cooked jubbly', 15],
	['Red banana', 5],
	['Tchiki monkey nuts', 5],
	['Sliced red banana', 5],
	['Stuffed snake', 20],
	['Bottle of wine', 14],
	['Field ration', 10],
	['Fresh monkfish', 1],
	['Locust meat', 3],
	['Roast bird meat', 6],
	['Roast beast meat', 8],
	['Spicy tomato', 2],
	['Spicy minced meat', 3],
	['Rainbow fish', 11],
	['Green gloop soup', 2],
	['Frogspawn gumbo', 2],
	['Frogburger', 2],
	["Coated frogs' legs", 2],
	['Bat shish', 2],
	['Fingers', 2],
	['Grubs à la mode', 2],
	['Roast frog', 2],
	['Mushrooms', 2],
	['Fillets', 2],
	['Loach', 3],
	['Eel sushi', 10],
	['Roe', 3],
	['Caviar', 5],
	['Pysk fish (0)', 5],
	['Suphi fish (1)', 8],
	['Leckish fish (2)', 11],
	['Brawk fish (3)', 14],
	['Mycil fish (4)', 17],
	['Roqed fish (5)', 20],
	['Kyren fish (6)', 23],
	['Guanic bat (0)', 5],
	['Prael bat (1)', 8],
	['Giral bat (2)', 11],
	['Phluxia bat (3)', 14],
	['Kryket bat (4)', 17],
	['Murng bat (5)', 20],
	['Psykk bat (6)', 23],
	['Honey locust', 20],
	['Silk dressing (2)', 100],
	['Bloody bracer', 2],
	['Dragonfruit', 10],
	['Paddlefish', 20],
	['Elven dawn', 1],
	['Cooked mystery meat', 5],
	['Steak sandwich', 6],
	['Corrupted paddlefish', 16],
	['Crystal paddlefish', 16],
	["Kovac's grog", 1]
];

for (const [name, healAmount] of others) {
	if (Eatables.some(i => i.name === name)) continue;
	if (!getItem(name)) continue;
	Eatables.push({
		name: name as string,
		id: itemID(name as string),
		healAmount: healAmount as number,
		raw: null
	});
}

let str = '';
for (const a of Eatables) {
	str += `${a.name} heals ${a.healAmount}\n`;
}
writeFileSync('food.txt', str);
