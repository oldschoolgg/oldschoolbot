import { Task } from 'klasa';
import { Items } from 'oldschooljs';

export default class extends Task {
	async init() {
		await Items.fetchAll();
	}

	async run() {
		if (!this.client.production) return;
		this.syncItems();
	}

	async syncItems() {
		this.client.console.debug('Fetching all OSJS items.');
		await Items.fetchAll();
	}
}
