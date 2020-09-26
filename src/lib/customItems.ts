import { Items } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';
import { itemNameMap } from 'oldschooljs/dist/structures/Items';

import { cleanString } from '../util';
import getOSItem from './util/getOSItem';

function setCustomItem(id: number, name: string, baseItem: Item, newItemData?: Partial<Item>) {
	Items.set(id, {
		...baseItem,
		...newItemData,
		name,
		id
	});
	const cleanName = cleanString(name);
	itemNameMap.set(cleanName, id);
}

export function initCustomItems() {
	setCustomItem(19939, 'Untradeable Mystery Box', getOSItem('Mystery box'));
	setCustomItem(6199, 'Tradeable Mystery Box', getOSItem('Mystery box'));
	setCustomItem(3062, 'Pet Mystery Box', getOSItem('Mystery box'));
	setCustomItem(3713, 'Holiday Mystery Box', getOSItem('Mystery box'));
	setCustomItem(5507, 'Remy', getOSItem('Herbi'));
	setCustomItem(3714, 'Shelldon', getOSItem('Herbi'));
	setCustomItem(9620, 'Doug', getOSItem('Herbi'));
	setCustomItem(9619, 'Lil Lamb', getOSItem('Herbi'));
	setCustomItem(10092, 'Zippy', getOSItem('Herbi'));
	setCustomItem(9058, 'Harry', getOSItem('Herbi'));
	setCustomItem(10329, 'Wintertoad', getOSItem('Herbi'));
	setCustomItem(3469, 'Klik', getOSItem('Herbi'));
	setCustomItem(21313, 'Scruffy', getOSItem('Herbi'));
	setCustomItem(9057, 'Zak', getOSItem('Herbi'));
	setCustomItem(8441, 'Hammy', getOSItem('Herbi'));
	setCustomItem(12592, 'Divine sigil', getOSItem('Elysian sigil'));
	setCustomItem(3454, 'Divine spirit shield', getOSItem('Elysian spirit shield'));
	setCustomItem(500, 'Skipper', getOSItem('Herbi'));

	// Dwarven Items

	// 2x faster chopping and wintertodt
	setCustomItem(472, 'Dwarven greataxe', getOSItem('Dragon pickaxe'));
	// 2x faster mining
	setCustomItem(476, 'Dwarven pickaxe', getOSItem('Dragon pickaxe'));
	// 2x faster smithing and crafting
	setCustomItem(474, 'Dwarven greathammer', getOSItem('Dragon warhammer'));
	// 2x faster smelting
	setCustomItem(12594, 'Dwarven gauntlets', getOSItem('Cooking gauntlets'));

	setCustomItem(478, 'Dwarven knife', getOSItem('Bronze knife'));
	// setCustomItem(11923, 'Dwarven tinderbox', getOSItem('Tinderbox'));

	setCustomItem(506, 'Dwarven bar', getOSItem('Steel bar'));
	setCustomItem(508, 'Dwarven ore', getOSItem('Iron ore'));

	setCustomItem(6741, 'Dwarven warhammer', getOSItem('Dragon warhammer'));

	setCustomItem(8871, 'Dwarven crate', getOSItem('Mystery box'));
}
