const { Command } = require('klasa');
const osrs = require('osrs-wrapper');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 2,
			description: 'Shows how much XP you have left until 99 in all skills.',
			usage: '[user:user|username:str]'
		});
	}

	async run(msg, [username]) {
		username = this.getUsername(username, msg);

		const player = await osrs.hiscores
			.getPlayer(username, 'Normal')
			.then(res => res)
			.catch(() => { throw this.client.notFound; });

		for (const skill in player.Skills) {
			if (player.Skills[skill].xp !== undefined) {
				if (skill === 'Overall' && player.Skills.Overall.xp > 299791913) player.Skills.Overall.xp = 299791913;
				if (player.Skills[skill].xp > 13034431 && skill !== 'Overall') player.Skills[skill].xp = 13034431;
				if (player.Skills[skill].xp < 13034432 && skill !== 'Overall') { player.Skills[skill].xp = parseInt(13034431 - player.Skills[skill].xp).toLocaleString(); }
			}
		}
		player.Skills.Overall.xp = parseInt(299791913 - player.Skills.Overall.xp).toLocaleString();
		const embed = await this.getStatsEmbed(username, 7981338, player, 'xp');
		return msg.send({ embed });
	}

};
