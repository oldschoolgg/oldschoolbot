const { Command } = require('klasa');
const { Hiscores } = require('oldschooljs');

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
		const player = await Hiscores.fetch(username).catch(err => {
			throw err.message;
		});

		let overall = 0;
		for (const skill in player.skills) {
			if (skill === 'overall') continue;
			const lvl = convertXPtoLVL(player.skills[skill].xp, 126);
			overall += lvl;
			player.skills[skill].level = lvl;
		}

		player.skills.overall.level = overall;

		const embed = await this.getStatsEmbed(username, 7981338, player, 'level', false);
		return msg.send({ embed });
	}
};
