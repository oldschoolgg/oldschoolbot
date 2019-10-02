const { Task } = require('klasa');
const fetch = require('node-fetch');
const { Items } = require('oldschooljs');

module.exports = class extends Task {
	init() {
		this.run();
	}
	async run() {
		this.syncItems();
		this.fetchOSBPrices();
	}

	async syncItems() {
		this.client.console.debug('Fetching all OSJS items.');
		Items.fetchAll();
	}

	async fetchOSBPrices() {
		this.client.console.debug('Fetching OSB prices.');
		const summary = await fetch(`https://rsbuddy.com/exchange/summary.json`).then(res =>
			res.json()
		);

		const prices = {};

		for (const ID in summary) {
			const { name } = summary[ID];
			prices[name.replace(/\W/g, '').toUpperCase()] = prices[ID] = {
				ID,
				name,
				buy: summary[ID].buy_average,
				sell: summary[ID].sell_average,
				overall: summary[ID].overall_average,
				store: summary[ID].sp
			};
		}

		this.client.settings.update('prices', prices);
	}
};
