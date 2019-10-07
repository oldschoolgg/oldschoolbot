const { Command } = require('klasa');
const { Hiscores } = require('oldschooljs');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			cooldown: 3,
			description: 'Shows the ranks of an account',
			usage: '(username:rsn)',
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	async run(msg, [username]) {
		const player = await Hiscores.fetch(username).catch(err => {
			throw err;
		});

		const embed = await this.getStatsEmbed(username, 7981338, player, 'rank', false);

		return msg.send({ embed });
	}
};
