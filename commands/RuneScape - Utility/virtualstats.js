const { Command } = require('klasa');
const osrs = require('osrs-wrapper');
const Crystalmethlabs = require('crystalmethlabs');
const cml = new Crystalmethlabs();

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 2,
			aliases: ['vs'],
			description: 'Shows the virtual stats of a OSRS account',
			usage: '[user:user|username:str]'
		});
	}
	async run(msg, [username]) {
		username = this.getUsername(username, msg);

		const player = await osrs.hiscores
			.getPlayer(username, 'Normal')
			.then(stats => stats)
			.catch(() => { throw this.client.notFound; });

		let overall = 0;
		for (const skill in player.Skills) {
			if (skill === 'Overall') continue;
			const lvl = cml.convertXPtoLVL(player.Skills[skill].xp, 126);
			overall += lvl;
			player.Skills[skill].level = lvl;
		}
		player.Skills.Overall.level = overall;
		const embed = await this.getStatsEmbed(username, 7981338, player);
		return msg.send({ embed });
	}

};
