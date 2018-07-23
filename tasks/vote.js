const { Task } = require('klasa');

module.exports = class extends Task {

	async run(vote) {
		const user = await this.client.users.fetch(vote.user);
		const amount = Math.floor(Math.random() * 5000000) + 1;
		this.client.voteLogs.send(`${user} just voted for Old School Bot and received ${amount.toLocaleString()} GP! Thank you <:Smiley:420283725469974529>`);
		user.configs.update('GP', amount);
	}

};
