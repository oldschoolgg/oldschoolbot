import { Task } from 'klasa';
import { Items } from 'oldschooljs';

import { initCustomItems } from '../lib/customItems';

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
