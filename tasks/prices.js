const { Task } = require('klasa');
const snekfetch = require('snekfetch');

module.exports = class extends Task {

	async run() {
		const summary = await snekfetch
			.get(`https://rsbuddy.com/exchange/summary.json`)
			.then(res => res.body);

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

		this.client.configs.update('prices', prices);
	}

};
