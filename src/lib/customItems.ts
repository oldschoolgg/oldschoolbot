import { Item } from 'oldschooljs/dist/meta/types';
import { Items } from 'oldschooljs';
import { cleanString } from '../util';
import { itemNameMap } from 'oldschooljs/dist/structures/Items';
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
}
