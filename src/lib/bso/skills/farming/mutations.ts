import { itemID } from 'oldschooljs';

import Farming from '@/lib/skilling/skills/farming/index.js';

export const mutations = [
	{
		chance: 30,
		plantName: 'Mango bush',
		output: itemID('Shiny mango')
	},
	{
		chance: 7,
		plantName: 'Cabbage',
		output: itemID('Cannonball cabbage')
	},
	{
		chance: 7,
		plantName: 'Potato',
		output: itemID('Sweet potato')
	},
	{
		chance: 7,
		plantName: 'Sweetcorn',
		output: itemID('Rainbow sweetcorn')
	},
	{
		chance: 7,
		plantName: 'Strawberry',
		output: itemID('White strawberry')
	},
	{
		chance: 7,
		plantName: 'Mushroom',
		output: itemID('Mooshroom')
	}
];

for (const mut of mutations) {
	const plant = Farming.Plants.find(i => i.name === mut.plantName);
	if (!plant) throw new Error(`Missing ${mut.plantName}`);
}
