const { Command } = require('klasa');
const osrs = require('osrs-wrapper');

const { convertXPtoLVL } = require('../../../config/util');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			cooldown: 2,
			aliases: ['vs'],
			description: 'Shows the virtual stats of a OSRS account',
			usage: '(username:rsn)',
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	async run(msg, [username]) {
		const player = await osrs.hiscores.getPlayer(username, 'Normal').catch(() => {
			throw this.client.notFound;
		});

		let overall = 0;
		for (const skill in player.Skills) {
			if (skill === 'Overall') continue;
			const lvl = convertXPtoLVL(player.Skills[skill].xp, 126);
			overall += lvl;
			player.Skills[skill].level = lvl;
		}

		player.Skills.Overall.level = overall;

		const embed = await this.getStatsEmbed(username, 7981338, player);
		return msg.send({ embed });
	}
};
