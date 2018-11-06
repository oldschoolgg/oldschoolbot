const { Task, util: { sleep, chunk } } = require('klasa');
const fetch = require('node-fetch');

module.exports = class extends Task {

	async run() {
		const rsnList = this.client.gateways.users.cache
			.filter(config => config.autoupdate)
			.map(config => config.RSN);

		const userArray = chunk(rsnList, 8);

		userArray.forEach(async list => {
			const multiQuery = list.map(rsn => `{"type": "update", "player": "${rsn}"}`).join(',');
			fetch(`https://crystalmathlabs.com/tracker/api.php?multiquery=[${multiQuery}]`);
			// Wait 5 seconds between each request
			await sleep(300);
		});
	}

};
