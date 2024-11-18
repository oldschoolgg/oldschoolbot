import { LootTable } from 'oldschooljs';

export const birdsNestID = 5075;

export const treeSeedsNest = new LootTable()
	.add('Acorn', 1, 214)
	.add('Apple tree seed', 1, 170)
	.add('Willow seed', 1, 135)
	.add('Banana tree seed', 1, 108)
	.add('Orange tree seed', 1, 85)
	.add('Curry tree seed', 1, 68)
	.add('Maple seed', 1, 54)
	.add('Pineapple seed', 1, 42)
	.add('Papaya tree seed', 1, 34)
	.add('Yew seed', 1, 27)
	.add('Palm tree seed', 1, 22)
	.add('Calquat tree seed', 1, 17)
	.add('Spirit seed', 1, 11)
	.add('Dragonfruit tree seed', 1, 6)
	.add('Magic seed', 1, 5)
	.add('Teak seed', 1, 4)
	.add('Mahogany seed', 1, 4)
	.add('Celastrus seed', 1, 3)
	.add('Redwood tree seed', 1, 2);

export const ringNests = new LootTable()
	.add('Sapphire ring', 1, 40)
	.add('Gold ring', 1, 35)
	.add('Emerald ring', 1, 15)
	.add('Ruby ring', 1, 9)
	.add('Diamond ring', 1, 1);

export const eggNest = new LootTable().add('Red bird egg').add('Blue bird egg').add('Green bird egg');

export const nestTable = new LootTable()
	.every(birdsNestID)
	.add(eggNest, 1, 3)
	.add(ringNests, 1, 32)
	.add(treeSeedsNest, 1, 65);

export const strungRabbitFootNestTable = new LootTable()
	.every(birdsNestID)
	.add(eggNest, 1, 3)
	.add(ringNests, 1, 32)
	.add(treeSeedsNest, 1, 60);
