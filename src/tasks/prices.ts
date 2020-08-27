import { Task } from 'klasa';
import { Items } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';
import { cleanString } from '../util';
import { itemNameMap } from 'oldschooljs/dist/structures/Items';
import getOSItem from '../lib/util/getOSItem';

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
function initCustomItems() {
	setCustomItem(19939, 'Untradeable Mystery Box', getOSItem('Mystery box'));
	setCustomItem(6199, 'Tradeable Mystery Box', getOSItem('Mystery box'));
	setCustomItem(3062, 'Pet Mystery Box', getOSItem('Mystery box'));
	setCustomItem(3713, 'Holiday Mystery Box', getOSItem('Mystery box'));
	setCustomItem(5507, 'Remy', getOSItem("Chef's hat"));
	setCustomItem(3714, 'Shelldon', getOSItem('Leather gloves'));
}

import { initCustomItems } from '../lib/customItems';

import { initCustomItems } from '../lib/customItems';

export default class extends Task {
	async init() {
		initCustomItems();
		await Items.fetchAll();
		initCustomItems();
	}

	async run() {
		if (!this.client.production) return;
		this.syncItems();
	}

	async syncItems() {
		this.client.console.debug('Fetching all OSJS items.');
		await Items.fetchAll();
		initCustomItems();
	}
}
