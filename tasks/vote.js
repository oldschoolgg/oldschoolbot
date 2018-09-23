const { Task } = require('klasa');

module.exports = class extends Task {

	async run(vote) {
		const user = await this.client.users.fetch(vote.user);
		const isInGuild = this.client.guilds.get('342983479501389826').members.has(vote.user);
		let amount = Math.floor(Math.random() * 5000000) + 500000;
		let bonuses = '';
		if (vote.isWeekend) {
			amount *= 2;
			bonuses += '<:MoneyBag:493286312854683654>';
		}
		if (isInGuild) {
			amount *= 1.5;
			bonuses += ' <:OSRSBot:363583286192111616>';
		}
		this.client.voteLogs.send(`${bonuses + user} just voted for Old School Bot and received ${amount.toLocaleString()} GP! Thank you <:Smiley:420283725469974529>`);
		user.configs.update('GP', user.configs.GP + amount);
	}

};
