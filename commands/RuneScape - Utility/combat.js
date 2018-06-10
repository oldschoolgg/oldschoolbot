const { Command } = require('klasa');
const osrs = require('osrs-wrapper');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 2,
			aliases: ['cb'],
			description: 'Shows your Combat level.',
			usage: '[user:user|username:str]'
		});
	}
	async run(msg, [username]) {
		username = this.getUsername(username, msg);

		const player = await osrs.hiscores
			.getPlayer(username, 'Normal')
			.then(stats => stats)
			.catch(() => { throw this.client.notFound; });

		const combatLevel = await this.combatLevel(player.Skills);

		return msg.send(`${username}'s Combat Level is **${combatLevel}**.`);
	}

};
