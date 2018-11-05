const { Command } = require('klasa');
const osrs = require('osrs-wrapper');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 2,
			description: 'Shows the level of a single stat, and the XP remaining.',
			usage:
                '<attack|defence|strength|hitpoints|ranged|prayer|' +
                'magic|cooking|woodcutting|fletching|fishing|firemaking|' +
                'crafting|smithing|mining|herblore|agility|thieving|slayer|' +
                'farming|runecrafting|hunter|construction> <username:str> [...]',
			usageDelim: ' '
		});
	}

	async run(msg, [skill, ...username]) {
		username = username.join(' ');
		skill = skill.charAt(0).toUpperCase() + skill.slice(1);

		const { level, xp } = await osrs.hiscores
			.getPlayer(username, 'Normal')
			.then(player => player.Skills[skill])
			.catch(() => { throw this.client.notFound; });

		if (level < 99) {
			const embed = new MessageEmbed()
				.setColor(8311585)
				.setDescription(
					`**${username}**'s ${skill} level is **${level}** and is **${this.xpLeft(level, xp)}** XP away from level **${level + 1}**`
				);
			return msg.send({ embed });
		} else {
			const embed = new MessageEmbed()
				.setColor(8311585)
				.setDescription(
					`**${username}**'s ${skill} level is **${level}** and is **${(200000000 - xp).toLocaleString()}** XP away from **200m**`
				);
			return msg.send({ embed });
		}
	}

	xpLeft(currentlevel, currentxp) {
		if (currentlevel === 99) return 0;
		return (this.convertLVLtoXP(currentlevel + 1) - currentxp).toLocaleString();
	}

};
