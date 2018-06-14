const { Command } = require('klasa');
const snekfetch = require('snekfetch');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 2,
			description: 'Shows the Time to 200m all of an account',
			usage: '[user:user|username:str]'
		});
	}

	async run(msg, [username]) {
		username = this.getUsername(username, msg);

		const time = await snekfetch
			.get(`http://crystalmathlabs.com/tracker/api.php?type=virtualhiscores&page=timeto200mall&players=${username}`)
			.then(async res => await this.cmlErrorCheck(msg, res) || parseInt(res.text.split(',')[1].split('.')[0]).toLocaleString())
			.catch(() => { throw this.client.cmlDown; });

		const embed = new MessageEmbed()
			.setColor(3120895)
			.setDescription(`**${username}**'s Time to 200m All is **${time}** hours.`);

		return msg.send({ embed });
	}

};
