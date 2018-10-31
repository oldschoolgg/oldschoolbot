const { Task } = require('klasa');

module.exports = class extends Task {

	async run({ user, isWeekend }) {
		const _user = await this.client.users.fetch(user);
		const member = await this.client.guilds
			.get('342983479501389826')
			.members.fetch(user)
			.catch(() => null);

		let amount = Math.floor(Math.random() * 5000000) + 500000;
		let bonuses = '';

		if (isWeekend) {
			amount *= 2;
			bonuses += '<:MoneyBag:493286312854683654>';
		}

		if (member) {
			amount = Math.floor(amount * 1.5);
			bonuses += ' <:OSRSBot:363583286192111616>';
		}

		this.client.voteLogs.send(
			`${bonuses} ${_user} just voted for Old School Bot and received ${amount.toLocaleString()} GP! Thank you <:Smiley:420283725469974529>`
		);
		_user.configs.update('GP', _user.configs.GP + amount);
	}

};
