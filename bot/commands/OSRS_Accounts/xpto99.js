const { Command } = require('klasa');
const { Hiscores } = require('oldschooljs');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			cooldown: 2,
			description: 'Shows how much XP you have left until 99 in all skills.',
			usage: '(username:rsn)',
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	async run(msg, [username]) {
		const player = await Hiscores.fetch(username).catch(err => {
			throw err.message;
		});

		let totalXP = 0;
		for (const skill in player.skills) {
			const { xp } = player.skills[skill];
			if (!xp) continue;
			if (skill !== 'overall') {
				const clampedXP = Math.min(xp, 13034431);
				const remainingXP = 13034431 - clampedXP;
				totalXP += clampedXP;
				player.skills[skill].xp = remainingXP.toLocaleString();
			}
		}

		player.skills.overall.xp = parseInt(299791913 - totalXP).toLocaleString();
		const embed = await this.getStatsEmbed(username, 7981338, player, 'xp', false);
		return msg.send({ embed });
	}
};
