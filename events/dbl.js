const { Event } = require('klasa');
const DBL = require('dblapi.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { name: 'ready', once: true });
	}

	run() {
		const dbl = new DBL(this.client.dblToken, { webhookPort: 80, webhookAuth: this.client.dblAuth });
		dbl.webhook.on('vote', async vote => {
			const user = await this.client.users.fetch(vote.user);
			this.client.voteLogs.send(`${user} just voted for Old School Bot! Thank you <:Smiley:420283725469974529>`);
		});
	}

};
