const { Command } = require('klasa');
const pets = require('../../resources/pets');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Rolls a chance at getting every pet at once.',
			usage: '<amount:int{1,100}>'
		});
	}

	async run(msg, [amount]) {
		const received = [];

		for (let i = 0; i < amount; i++) {
			for (const pet in pets) if (pet.roll()) received.push(pet.emoji);
		}

		if (received.length === 0) return msg.send("You didn't get any pets!");
		return msg.send(pets.join(' '));
	}


};
