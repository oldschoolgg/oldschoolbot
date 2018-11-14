const { Command } = require('klasa');
const osrs = require('osrs-wrapper');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 2,
			description: 'Shows how much XP you have left until 99 in all skills.',
			usage: '[user:user|username:str]',
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	async run(msg, [username]) {
		username = this.getUsername(username, msg);

		const player = await osrs.hiscores
			.getPlayer(username, 'Normal')
			.then(res => res)
			.catch(() => { throw this.client.notFound; });

		let totalXP = 0;
		for (const skill in player.Skills) {
			const { xp } = player.Skills[skill];
			if (!xp) continue;
			if (skill !== 'Overall') {
				const clampedXP = Math.min(xp, 13034431);
				const remainingXP = 13034431 - clampedXP;
				totalXP += clampedXP;
				player.Skills[skill].xp = remainingXP.toLocaleString();
			}
		}
		player.Skills.Overall.xp = parseInt(299791913 - totalXP).toLocaleString();
		const embed = await this.getStatsEmbed(username, 7981338, player, 'xp', false);
		return msg.send({ embed });
	}

};
