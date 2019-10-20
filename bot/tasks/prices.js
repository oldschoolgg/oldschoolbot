const { Task } = require('klasa');
const fetch = require('node-fetch');
const { Items } = require('oldschooljs');

const { cleanString } = require('../../config/util');

module.exports = class extends Task {
	async init() {
		await this.run();
		await this.client.tasks.get('spawnWorkerThread').run();
	}

	async run() {
		if (this.client.production) {
			this.syncItems();
			this.fetchOSBPrices();
		} else {
			console.log('Not syncing items/OBS prices in development mode.');
		}
	}

	async syncItems() {
		this.client.console.debug('Fetching all OSJS items.');
		await Items.fetchAll();
	}

	async fetchOSBPrices() {
		this.client.console.debug('Fetching OSB prices.');
		const summary = await fetch(`https://rsbuddy.com/exchange/summary.json`).then(res =>
			res.json()
		);

		const prices = {};

		for (const ID in summary) {
			const { name } = summary[ID];
			prices[cleanString(name)] = prices[ID] = {
				ID,
				name,
				buy: summary[ID].buy_average,
				sell: summary[ID].sell_average,
				overall: summary[ID].overall_average,
				store: summary[ID].sp
			};
		}

		await this.client.settings.update('prices', prices);
	}
};
