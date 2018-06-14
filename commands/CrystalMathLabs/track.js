const { Command } = require('klasa');
const Crystalmethlabs = require('crystalmethlabs');
const osrs = new Crystalmethlabs('osrs');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 2,
			description: 'Tracks gains on an account.',
			usage: '<overall|attack|defence|strength|hitpoints|ranged|' +
                    'prayer|magic|cooking|woodcutting|fletching|fishing|' +
                    'firemaking|crafting|smithing|mining|herblore|agility|' +
                    'thieving|slayer|farming|runecrafting|hunter|construction> <day|week|month|year> <username:str> [...]',
			usageDelim: ' '
		});
	}

	async run(msg, [skill, timePeriod, ...username]) {
		const { err, stats } = await osrs.track(username, this.client.timePeriods[timePeriod]);
		if (err) return msg.send(err);

		username = username.join(' ');

		const embed = new MessageEmbed()
			.setColor(3120895)
			.setFooter(`CrystalMathLabs / ${skill} / ${timePeriod}`, 'https://i.imgur.com/k12Kmhg.png')
			.setDescription(username)
			.addField('EHP', stats[skill].ehpGained, true)
			.addField('Levels', stats[skill].levelsGained, true)
			.addField('Ranks', stats[skill].ranksGained, true)
			.addField('XP', stats[skill].xpGained.toLocaleString(), true);

		return msg.send({ embed });
	}

};
