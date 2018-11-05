const { Command } = require('klasa');
const osrs = require('osrs-wrapper');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 2,
			aliases: [],
			description: 'Shows the stats of a UIM account.',
			usage: '[user:user|username:str]'
		});
	}
	async run(msg, [username]) {
		username = this.getUsername(username, msg);

		const player = await osrs.hiscores
			.getPlayer(username, 'Ultimate')
			.then(res => res)
			.catch(() => { throw this.client.notFound; });

		const embed = await this.getStatsEmbed(username, 5460819, player);

		return msg.send({ embed });
	}

};
