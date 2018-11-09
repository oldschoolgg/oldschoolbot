const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const math = require('mathjs');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['c'],
			description: 'Performs mathematical calculations.',
			usage: '<expression:str>'
		});
	}
	async run(msg, [expression]) {
		let ans;
		try {
			ans = math.eval(expression);
		} catch (error) {
			return msg.send('Please input a valid calculation.');
		}

		const embed = new MessageEmbed()
			.setColor(0xffffff)
			.setTitle('Calculation')
			.addField('Input', `\n${expression}`)
			.addField('Output', `\n${ans}`);

		return msg.send({ embed });
	}

};
