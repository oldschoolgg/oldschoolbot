const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['c'],
			description: 'Performs mathematical calculations.',
			usage: '<expression:str>'
		});
	}
	async run(msg, [expression]) {
		const expressionFixed = this.numberFormatter(expression);
		let ans;
		try {
			ans = eval(expressionFixed);
		} catch (error) {
			return msg.send('Please input a valid expression (e.g. +calc 100M / 5).');
		}

		const ansFixed = this.abbreviateNumber(ans);

		const embed = new MessageEmbed()
			.setColor(0xffffff)
			.setTitle('Calculation')
			.addField('Input', `\n${expression}`)
			.addField('Output', `\n${ansFixed}`);

		return msg.send({ embed });
	}

	numberFormatter(exp) {
		if (exp.includes('k')) {
			exp = exp.replace('k', '000');
		}
		if (exp.includes('K')) {
			exp = exp.replace('K', '000');
		}
		if (exp.includes('m')) {
			exp = exp.replace('m', '000000');
		}
		if (exp.includes('M')) {
			exp = exp.replace('M', '000000');
		}
		if (exp.includes('b')) {
			exp = exp.replace('b', '000000000');
		}
		if (exp.includes('B')) {
			exp = exp.replace('B', '000000000');
		}
		return exp;
	}

	//	credit to https://stackoverflow.com/questions/2685911/is-there-a-way-to-round-numbers-into-a-reader-friendly-format-e-g-1-1k
	abbreviateNumber(number) {
		let decPlaces = 3;
		decPlaces = Math.pow(10, decPlaces);
		const abbrev = ['K', 'M', 'B'];
		for (let i = abbrev.length - 1; i >= 0; i--) {
			const size = Math.pow(10, (i + 1) * 3);
			if (size <= number) {
				number = Math.round(number * decPlaces / size) / decPlaces;
				if ((number === 1000) && (i < abbrev.length - 1)) {
					number = 1;
					i++;
				}
				number += abbrev[i];
				break;
			}
		}

		return number;
	}

};
