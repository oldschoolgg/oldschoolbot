const { Command } = require('klasa');
const { Hiscores } = require('oldschooljs');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			cooldown: 2,
			aliases: ['league', 'leagues', 'l'],
			description: 'Shows the stats of a Seasonal leagues account.',
			usage: '(username:rsn)',
			requiredPermissions: ['EMBED_LINKS']
		});
	}
	async run(msg, [username]) {
		const player = await Hiscores.fetch(username, { type: 'seasonal' }).catch(err => {
			throw err.message;
		});

		const embed = this.getStatsEmbed(username, 7981338, player);

		embed.setFooter(`Twisted League`);
		return msg.send({ embed });
	}
};
