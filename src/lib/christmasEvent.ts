import { randArrItem } from 'e';
import { Bank } from 'oldschooljs';

import { BitField } from './constants';
import resolveItems from './util/resolveItems';

const permIronRares = resolveItems([
	'Inverted santa hat',
	'Black santa hat',
	'Santa hat',
	'Red partyhat',
	'Yellow partyhat',
	'Blue partyhat',
	'Purple partyhat',
	'Green partyhat',
	'White partyhat'
]);

const baseChristmasItems = resolveItems([
	'Bobble hat',
	'Jester hat',
	'Tri-jester hat',
	'Woolly hat',
	'Bobble scarf',
	'Jester scarf',
	'Tri-jester scarf',
	'Woolly scarf',
	// 2013
	'Wintumber tree',
	'Reindeer hat',
	// 2014
	'Santa mask',
	'Santa hat',
	'Santa jacket',
	'Santa pantaloons',
	'Santa gloves',
	'Santa boots',
	'Antisanta mask',
	'Antisanta jacket',
	'Antisanta pantaloons',
	'Antisanta gloves',
	'Antisanta boots',
	// 2016
	'Snow globe',
	'Sack of presents',
	'Giant present',
	// 2017
	'Snow imp costume head',
	'Snow imp costume body',
	'Snow imp costume legs',
	'Snow imp costume gloves',
	'Snow imp costume feet',
	'Snow imp costume tail',
	'Bulging sack',
	// 2018
	'Candy cane',
	'Star-face',
	'Tree top',
	'Tree skirt',
	// 2019
	'Blue gingerbread shield',
	'Green gingerbread shield',
	'Red gingerbread shield',
	// 2020
	'Giant boulder',
	25_282, // Sled
	// 2021
	26_306, // Chocolate chips
	26_304, // Chocolate chips
	'Secret santa present',
	'Snowman ring',
	'Festive elf slippers',
	'Festive elf hat',
	'Pink stained full helm',
	'Pink stained platebody',
	'Pink stained platelegs',
	// 2022
	'Eggnog',
	"Santa's list",
	'Christmas jumper',
	'Snow goggles & hat',
	'Sack of coal',
	'Festive nutcracker top',
	'Festive nutcracker trousers',
	'Festive nutcracker hat',
	'Festive nutcracker boots',
	'Festive nutcracker staff',
	'Sweet nutcracker top',
	'Sweet nutcracker trousers',
	'Sweet nutcracker hat',
	'Sweet nutcracker boots',
	'Sweet nutcracker staff',
	'Festive games crown',
	'Sack of coal',
	'Black partyhat',
	'Rainbow partyhat'
]);

export function findXmasItemsCanGive(cl: Bank, user: MUser, dontFilter = false) {
	const isPerm = user.isIronman && user.bitfield.includes(BitField.PermanentIronman);
	const items = isPerm ? [...baseChristmasItems, ...permIronRares] : baseChristmasItems;
	return dontFilter ? [...items] : items.filter(i => !cl.has(i));
}

export function christmasEventReward(user: MUser, quantity: number) {
	const effectiveCL = user.cl.clone();
	const loot = new Bank();

	for (let i = 0; i < quantity; i++) {
		// Give 10 items they don't own
		for (let i = 0; i < 10; i++) {
			const itemsCanGive = findXmasItemsCanGive(effectiveCL, user);
			const itemToGive = randArrItem(itemsCanGive);
			if (!itemToGive) continue;
			effectiveCL.add(itemToGive);
			loot.add(itemToGive);
		}
	}

	return loot;
}
