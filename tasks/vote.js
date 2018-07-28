const { Task } = require('klasa');

module.exports = class extends Task {

	async run(vote) {
		const user = await this.client.users.fetch(vote.user);
		let amount = Math.floor(Math.random() * 5000000) + 500000;
		if (vote.isWeekend) amount *= 2;
		this.client.voteLogs.send(`${user} just voted for Old School Bot and received ${amount.toLocaleString()} GP! Thank you <:Smiley:420283725469974529>`);
		user.configs.update('GP', user.configs.GP + amount);
	}

};
