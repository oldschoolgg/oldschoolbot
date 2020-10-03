import { Argument } from 'klasa';
import { Items } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { stringMatches } from '../lib/util';
import getOSItem from '../lib/util/getOSItem';

export default class extends Argument {
	async run(itemName: string): Promise<Item[]> {
		// guarantee all characters are numbers
		const parsed = Number(itemName);
		if (!isNaN(parsed)) {
			return [getOSItem(parsed)];
		}
		const osItems = Items.filter(i => stringMatches(i.name, itemName)).array() as Item[];
		if (!osItems.length) throw `That item doesnt exist.`;
		return osItems;
	}
}
