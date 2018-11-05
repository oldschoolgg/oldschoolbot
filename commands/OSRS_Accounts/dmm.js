const { Command } = require('klasa');
const osrs = require('osrs-wrapper');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 2,
			description: 'Shows the stats of a DMM account.',
			usage: '[user:user|username:str]'
		});
	}
	async run(msg, [username]) {
		username = this.getUsername(username, msg);

		const player = await osrs.hiscores
			.getPlayer(username, 'Deadman')
			.then(stats => stats)
			.catch(() => { throw this.client.notFound; });

		const embed = await this.getStatsEmbed(username, 11995146, player);

		return msg.send({ embed });
	}

};
