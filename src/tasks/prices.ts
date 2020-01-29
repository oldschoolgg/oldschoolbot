import { Task } from 'klasa';
import { Items } from 'oldschooljs';

export default class extends Task {
	async init() {
		this.run();
	}

	async run() {
		this.syncItems();
	}

	async syncItems() {
		this.client.console.debug('Fetching all OSJS items.');
		await Items.fetchAll();
	}
}
