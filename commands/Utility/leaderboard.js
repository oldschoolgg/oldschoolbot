const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Shows the people with the most virtual GP.'
		});
	}

	async run(msg) {
		const users = this.client.users.filter(user => user.configs.GP > 0).sort((a, b) => b.configs.GP - a.configs.GP).first(10);
		const leaderboard = users.map(user => `**${user.username}** has ${user.configs.GP.toLocaleString()} GP `);
		return msg.send(leaderboard.join('\n'));
	}

};
