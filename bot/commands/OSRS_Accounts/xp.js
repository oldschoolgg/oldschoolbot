const { Command } = require('klasa');
const { Hiscores } = require('oldschooljs');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			cooldown: 2,
			description: 'Shows your XP in all skills.',
			usage: '(username:rsn)',
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	async run(msg, [username]) {
		const player = await Hiscores.fetch(username).catch(err => {
			throw err.message;
		});

		for (const skill in player.Skills) {
			if (player.Skills[skill].xp !== undefined) {
				player.Skills[skill].xp = player.Skills[skill].xp.toLocaleString();
			}
		}

		const embed = await this.getStatsEmbed(username, 7981338, player, 'xp', false);

		return msg.send({ embed });
	}
};
