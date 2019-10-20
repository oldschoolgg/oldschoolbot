const { Command } = require('klasa');
const { Hiscores } = require('oldschooljs');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			cooldown: 2,
			aliases: [],
			description: 'Shows the stats of a UIM account.',
			usage: '(username:rsn)',
			requiredPermissions: ['EMBED_LINKS']
		});
	}
	async run(msg, [username]) {
		const player = await Hiscores.fetch(username, { type: 'ultimate' }).catch(err => {
			throw err.message;
		});

		const embed = this.getStatsEmbed(username, 5460819, player);

		return msg.send({ embed });
	}
};
