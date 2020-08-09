import { Argument } from 'klasa';
import { Items } from 'oldschooljs';

import { Item } from 'oldschooljs/dist/meta/types';
import getOSItem from '../lib/util/getOSItem';
import { stringMatches } from '../lib/util';

export default class extends Argument {
	async run(itemName: string) {
		// guarantee all characters are numbers
		if (
			!isNaN(parseInt(itemName)) &&
			parseInt(itemName).toString().length === itemName.length
		) {
			return [getOSItem(parseInt(itemName))];
		}

		const osItems = Items.filter(i => stringMatches(i.name, itemName)).array() as Item[];
		if (!osItems.length) throw `${itemName} doesnt exist.`;

		return osItems;
	}
}
