const { Command } = require('klasa');
const osrs = require('osrs-wrapper');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 2,
			aliases: ['iron', 'im'],
			description: 'Shows the stats of an Ironman account.',
			usage: '[user:user|username:str]'
		});
	}
	async run(msg, [username]) {
		username = this.getUsername(username, msg);

		const player = await osrs.hiscores
			.getPlayer(username, 'Ironman')
			.then(stats => stats)
			.catch(() => { throw this.client.notFound; });

		const embed = await this.getStatsEmbed(username, 5460819, player);

		return msg.send({ embed });
	}

};
