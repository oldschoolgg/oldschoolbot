const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			description: 'Simulates dice rolls from Runescape.',
			usage: '[amount:int{1,2147483647}]',
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	async run(msg, [amount]) {
		const roll = Math.floor(Math.random() * 100) + 1;

		const embed = new MessageEmbed()
			.setColor(39168)
			.setThumbnail('https://i.imgur.com/sySQkSX.png')
			.setTitle('Dice Roll');

		if (!amount) {
			embed.setDescription(`You rolled [**${roll}**]() on the percentile dice.`);
		} else {
			const gp = msg.author.settings.get('GP');
			if (amount > gp) throw "You don't have enough GP.";

			msg.author.settings.update('GP', roll >= 55 ? gp + amount : gp - amount);

			embed.setDescription(
				`You rolled [**${roll}**]() on the percentile dice, and you ${
					roll >= 55 ? 'won' : 'lost'
				} ${amount} GP.`
			);
		}
		return msg.send({ embed });
	}
};
