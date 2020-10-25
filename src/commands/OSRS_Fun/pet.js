const { Command } = require('klasa');
const { cleanString } = require('../../util');
const pets = require('../../../data/pets');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			cooldown: 2,
			description: 'Rolls a singular pet until you get it and shows the KC/Rolls',
			usage: '<petName:str>'
		});
	}

	async run(msg, [petName]) {
		const cleanName = cleanString(petName);

		const pet = pets.find(
			_pet => cleanString(_pet.name) === cleanName || _pet.altNames.includes(cleanName)
		);
		if (!pet) throw "I don't recognize that pet!";

		const count = pet.finish();

		return msg.send(pet.formatFinish(count));
	}
};
