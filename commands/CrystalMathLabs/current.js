const { Command } = require('klasa');
const snekfetch = require('snekfetch');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 2,
			description: 'Shows the current records.',
			usage: '<overall|attack|defence|strength|hitpoints|ranged|prayer|magic|' +
                    'cooking|woodcutting|fletching|fishing|firemaking|crafting|smithing|' +
                    'mining|herblore|agility|thieving|slayer|farming|runecrafting|hunter|' +
                    'construction|ehp> <day|week|month> [count:int{1,20}]',
			usageDelim: ' '
		});
	}

	async run(msg, [skill, timePeriod, count = 10]) {
		let body = await snekfetch
			.get(`https://crystalmathlabs.com/tracker/api.php?type=currenttop&timeperiod=${timePeriod}&skill=${skill}`)
			.then(async res => await this.cmlErrorCheck(msg, res) || res.text)
			.catch(() => { throw this.client.cmlDown; });

		const top = [];
		body = body.split('\n');
		body.pop();

		for (let i = 0; i < body.length; i++) {
			const info = body[i].split(',');
			top.push({
				username: info[0],
				gained: parseFloat(info[1])
			});
		}

		const usernames = [];
		const gains = [];

		for (let i = 0; i < count; i++) {
			usernames.push(top[i].username);
			gains.push(top[i].gained.toLocaleString());
		}

		const embed = new MessageEmbed()
			.setColor(3120895)
			.setAuthor('Current Top')
			.setFooter(`CrystalMathLabs / ${count} Players / ${skill} / ${timePeriod}`)
			.addField('Name', usernames.join('\n'), true)
			.addField(`Gained ${skill} XP`, gains.join('\n'), true);
		return msg.send({ embed });
	}

};
