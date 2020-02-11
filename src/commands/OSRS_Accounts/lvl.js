const { Command } = require('klasa');
const { Hiscores } = require('oldschooljs');

const { xpLeft } = require('../../util');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			cooldown: 2,
			description: 'Shows the level of a single stat, and the XP remaining.',
			usage:
				'<attack|defence|strength|hitpoints|ranged|prayer|' +
				'magic|cooking|woodcutting|fletching|fishing|firemaking|' +
				'crafting|smithing|mining|herblore|agility|thieving|slayer|' +
				'farming|runecraft|hunter|construction> (username:...rsn)',
			usageDelim: ' ',
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	async run(msg, [skill, username]) {
		const { level, xp } = await Hiscores.fetch(username)
			.then(player => player.skills[skill])
			.catch(err => {
				throw err.message;
			});

		let str = `**${username}**'s ${skill} level is **${level}** and is`;

		if (level < 99) {
			str += ` **${xpLeft(xp)}** XP away from level **${level + 1}**.`;
		} else {
			str += ` **${(200000000 - xp).toLocaleString()}** XP away from **200m**.`;
		}

		return msg.send(str);
	}
};
