const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, { description: 'Simulates Dicing from Runescape.' });
	}

	async run(msg) {
		const embed = new this.client.methods.Embed()
			.setColor(39168)
			.setThumbnail('https://i.imgur.com/sySQkSX.png')
			.setTitle('Dice Roll')
			.setDescription(`You rolled [**${Math.floor(Math.random() * 100) + 1}**]() on the percentile dice.`);

		return msg.send({ embed });
	}

};
