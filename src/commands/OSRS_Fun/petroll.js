const { Command } = require('klasa');
const { roll } = require('../../util');
const pets = require('../../../data/pets');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			description: 'Rolls a chance at getting every Pet at once.',
			usage: '<amount:int{1,100}>'
		});
	}

	async run(msg, [amount]) {
		const received = [];

		for (let i = 0; i < amount; i++) {
			for (const pet of pets) {
				if (roll(pet.chance)) received.push(pet.emoji);
			}
		}

		if (received.length === 0) return msg.send("You didn't get any pets!");
		return msg.send(received.join(' '));
	}
};
