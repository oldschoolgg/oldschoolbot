import { Task } from 'klasa';

export default class extends Task {
	async run() {
		if (!this.client.production) return;
		await this.syncItems();
	}

	async syncItems() {
		this.client.console.debug('Fetching all OSJS items.');
	}
}
