const { Command } = require('klasa');
const { util: { escapeMarkdown } } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Shows the people with the most virtual GP.',
			usage: '[pets]'
		});
	}

	async run(msg, [board = 'gp']) {
		if (board === 'gp') {
			const users = this.client.users
				.filter(user => user.settings.get('GP') > 0)
				.sort((a, b) => b.settings.get('GP') - a.settings.get('GP')).first(10);

			const leaderboard = users.map(({ username, settings }) => `**${escapeMarkdown(username)}** has ${settings.get('GP').toLocaleString()} GP `);

			return msg.send(leaderboard.join('\n') || 'Nobody has any GP!');
		} else {
			const users = this.client.users
				.filter(user => Object.keys(user.settings.get('pets')).length > 0)
				.sort((a, b) => Object.keys(b.settings.get('pets')).length - Object.keys(a.settings.get('pets')).length).first(10);

			const leaderboard = users.map(({ username, settings }) => `**${escapeMarkdown(username)}** has ${Object.keys(settings.get('pets')).length} pets `);

			return msg.send(leaderboard.join('\n') || 'Nobody has any pets!');
		}
	}

};
