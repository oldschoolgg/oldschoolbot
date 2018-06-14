const { Task } = require('klasa');
const snekfetch = require('snekfetch');
const delay = time => new Promise(res => setTimeout(() => res(), time));

module.exports = class extends Task {

	async run() {
		const chunks = chunk(this.client.gateways.users.cache
		    .filter(config => config.autoupdate)
		    .map(config => `{"type": "update", "player": "${config.RSN}"}`), 5);
		for (const userChunk of chunks) {
		    snekfetch.get(`https://crystalmathlabs.com/tracker/api.php?multiquery=[${userChunk.join(',')}]`).catch(() => null);
		    await sleep(500);
		}
	}

};
