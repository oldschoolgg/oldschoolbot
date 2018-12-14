const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Shows the people with the most virtual GP.'
		});
	}

	async run(msg) {
		const users = this.client.users
			.filter(user => user.settings.get('GP') > 0)
			.sort((a, b) => b.settings.get('GP') - a.settings.get('GP')).first(10);

		const leaderboard = users.map(({ username, settings }) => `**${username}** has ${settings.get('GP').toLocaleString()} GP `);

		return msg.send(leaderboard.join('\n') || 'Nobody has any GP!');
	}

};
