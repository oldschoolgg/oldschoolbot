import { Items } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { stringMatches } from '../util';

export default function getOSItems(itemName: string | number): Item[] {
	let osItems = [];

	let identifier: string | number | undefined = '';
	if (typeof itemName === 'number') {
		identifier = itemName;
		osItems = Items.filter(item => item.id === identifier).array() as Item[];
	} else {
		osItems = Items.filter(item => !item.duplicate && stringMatches(item.name, itemName)).array() as Item[];
	}
	if (osItems.length === 0) throw "That item doesn't exist.";
	return osItems;
}
