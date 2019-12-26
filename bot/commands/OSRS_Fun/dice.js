const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const {
	Util: { toKMB }
} = require('oldschooljs');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			description: 'Simulates dice rolls from Runescape.',
			usage: '[amount:int{1}]',
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
			await msg.author.settings.sync(true);
			const gp = msg.author.settings.get('GP');
			if (amount > gp) throw "You don't have enough GP.";

			let amountToAdd = roll >= 55 ? gp + amount : gp - amount;
			if (roll === 73) amountToAdd += amount > 100 ? amount * 0.2 : amount + 73;

			await msg.author.settings.update('GP', amountToAdd);

			embed.setDescription(
				`You rolled **${roll}** on the percentile dice, and you ${
					roll >= 55 ? 'won' : 'lost'
				} ${toKMB(amountToAdd - gp)} GP. ${
					roll === 73 ? '<:bpaptu:647580762098368523>' : ''
				}`
			);
		}
		return msg.send({ embed });
	}
};
