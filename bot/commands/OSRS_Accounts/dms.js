const { Command } = require('klasa');
const osrs = require('osrs-wrapper');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 2,
			aliases: ['seasonal', 'sdmm'],
			description: 'Shows the stats of a Seasonal Deadman account.',
			usage: '[username:rsn]',
			requiredPermissions: ['EMBED_LINKS']
		});
	}
	async run(msg, [username]) {
		const player = await osrs.hiscores
			.getPlayer(username, 'seasonal')
			.catch(() => { throw this.client.notFound; });

		const embed = await this.getStatsEmbed(username, 11995146, player);

		return msg.send({ embed });
	}

};
