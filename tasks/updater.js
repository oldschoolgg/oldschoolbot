const { Task } = require('klasa');
const snekfetch = require('snekfetch');
const delay = time => new Promise(res => setTimeout(() => res(), time));

module.exports = class extends Task {

	async run() {
		const userArray = [];
		this.client.gateways.users.cache.filter(config => config.autoupdate).forEach(config => {
			userArray.push(`{"type": "update", "player": "${config.RSN}"}`);
		});
		for (let i = 0; i < userArray.length / 5; i++) {
			const usernames = userArray.slice(i, i + 5).join(', ');
			snekfetch.get(`https://crystalmathlabs.com/tracker/api.php?multiquery=[${usernames}]`).catch(() => null);
			await delay(500);
		}
	}

};
