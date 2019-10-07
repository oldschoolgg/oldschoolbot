const { Command } = require('klasa');
const { Hiscores } = require('oldschooljs');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			cooldown: 2,
			aliases: ['seasonal', 'sdmm'],
			description: 'Shows the stats of a Seasonal Deadman account.',
			usage: '(username:rsn)',
			requiredPermissions: ['EMBED_LINKS']
		});
	}
	async run(msg, [username]) {
		const player = await Hiscores.fetch(username, { type: 'seasonal' }).catch(err => {
			throw err.message;
		});

		const embed = await this.getStatsEmbed(username, 11995146, player);

		return msg.send({ embed });
	}
};
