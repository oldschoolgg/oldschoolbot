import { Time } from 'e';
import { Task } from 'klasa';

import { cacheCleanup } from '../lib/cacheCleanup';

export default class extends Task {
	async init() {
		if (this.client.cleanupTicker) {
			clearTimeout(this.client.cleanupTicker);
		}
		const ticker = async () => {
			try {
				await cacheCleanup(this.client);
			} catch (err) {
				console.error(err);
			} finally {
				this.client.cleanupTicker = setTimeout(ticker, Time.Hour * 2);
			}
		};
		ticker();
	}

	async run() {}
}
