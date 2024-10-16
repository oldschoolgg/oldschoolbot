import { Bank } from 'oldschooljs/dist/util';
import type { ForesterRation } from '../../types';
import { Cookables } from './cooking';

const leafNames = ['Leaves', 'Oak leaves', 'Willow leaves', 'Maple leaves', 'Yew leaves', 'Magic leaves'];
const rationLeafTable = leafNames.map((leafName, index) => ({
	name: leafName,
	baseRations: (index + 1) * 2
}));

function fishFoodMultiplier(level: number): number {
	if (level >= 70) return 3;
	if (level >= 30) return 2;
	return 1;
}

const compatibleFoods = [
	{ name: 'Shrimps', foodType: 'fish' },
	{ name: 'Anchovies', foodType: 'fish' },
	{ name: 'Cooked chicken', foodType: 'chicken' },
	{ name: 'Cooked meat', foodType: 'meat' },
	{ name: 'Sardine', foodType: 'fish' },
	{ name: 'Herring', foodType: 'fish' },
	{ name: 'Trout', foodType: 'fish' },
	{ name: 'Pike', foodType: 'fish' },
	{ name: 'Cod', foodType: 'fish' },
	{ name: 'Salmon', foodType: 'fish' },
	{ name: 'Cooked slimy eel', foodType: 'fish' },
	{ name: 'Tuna', foodType: 'fish' },
	{ name: 'Cooked karambwan', foodType: 'fish' },
	{ name: 'Rainbow fish', foodType: 'fish' },
	{ name: 'Cave eel', foodType: 'fish' },
	{ name: 'Lobster', foodType: 'fish' },
	{ name: 'Bass', foodType: 'fish' },
	{ name: 'Swordfish', foodType: 'fish' },
	{ name: 'Monkfish', foodType: 'fish' },
	{ name: 'Shark', foodType: 'fish' },
	{ name: 'Sea turtle', foodType: 'fish' },
	{ name: 'Anglerfish', foodType: 'fish' },
	{ name: 'Dark crab', foodType: 'fish' },
	{ name: 'Manta ray', foodType: 'fish' }
];

const ForestryRations: ForesterRation[] = [];
for (const leaf of rationLeafTable) {
	for (const food of compatibleFoods) {
		const cookable = Cookables.find(cookable => cookable.name === food.name);
		if (!cookable) continue;

		ForestryRations.push({
			name: `Forester's ration (${leaf.name} + ${food.name})`,
			inputLeaf: new Bank({ [leaf.name]: 1 }),
			inputFood: new Bank({ [food.name]: 1 }),
			rationsAmount: leaf.baseRations * (food.foodType === 'fish' ? fishFoodMultiplier(cookable.level) : 2)
		});
	}
}

export default ForestryRations;
