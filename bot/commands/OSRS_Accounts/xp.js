const { Command } = require('klasa');
const osrs = require('osrs-wrapper');

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
		const player = await osrs.hiscores.getPlayer(username, 'Normal').catch(() => {
			throw this.client.notFound;
		});

		for (const skill in player.Skills) {
			if (player.Skills[skill].xp !== undefined) {
				player.Skills[skill].xp = player.Skills[skill].xp.toLocaleString();
			}
		}

		const embed = await this.getStatsEmbed(username, 7981338, player, 'xp');

		return msg.send({ embed });
	}
};
