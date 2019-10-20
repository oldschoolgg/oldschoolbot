const { Command } = require('klasa');
const { Hiscores } = require('oldschooljs');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			cooldown: 2,
			aliases: ['s'],
			description: 'Shows the stats of a OSRS account',
			usage: '(username:rsn)',
			requiredPermissions: ['EMBED_LINKS']
		});
	}
	async run(msg, [username]) {
		const player = await Hiscores.fetch(username).catch(err => {
			throw err.message;
		});

		if (msg.guild && this.client.settings.usernameCache[msg.guild.id]) {
			this.client.tasks.get('levelChecker').checkPlayers([player]);
		}

		const embed = this.getStatsEmbed(username, 7981338, player);

		return msg.send({ embed });
	}
};
