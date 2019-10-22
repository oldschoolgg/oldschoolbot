const { Command } = require('klasa');
const { Hiscores } = require('oldschooljs');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			cooldown: 2,
			aliases: ['cb'],
			description: 'Shows your Combat level.',
			usage: '(username:rsn)'
		});
	}
	async run(msg, [username]) {
		const player = await Hiscores.fetch(username).catch(err => {
			throw err.message;
		});

		return msg.send(`${username}'s Combat Level is **${player.combatLevel}**.`);
	}
};
