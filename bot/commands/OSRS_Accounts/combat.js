const { Command } = require('klasa');
const osrs = require('osrs-wrapper');

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
		const player = await osrs.hiscores.getPlayer(username, 'Normal').catch(() => {
			throw this.client.notFound;
		});

		const combatLevel = await this.combatLevel(player.Skills);

		return msg.send(`${username}'s Combat Level is **${combatLevel}**.`);
	}
};
