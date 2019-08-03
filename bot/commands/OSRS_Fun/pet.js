const { Command } = require('klasa');
const { cleanString } = require('../../../config/util');
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

		const pet = pets.find(_pet => cleanString(_pet.name) === cleanName || _pet.altNames.includes(cleanName));
		if (!pet) throw "I don't recognize that pet!";

		const count = pet.finish();
		let petMessage = pet.formatFinish(count);

		const petRecords = this.client.settings.get('petRecords');
		const lowest = petRecords.lowest[pet.id];
		const highest = petRecords.highest[pet.id];

		if (!lowest || count < lowest) {
			petRecords.lowest[pet.id] = count;
			this.client.settings.update('petRecords', { ...petRecords });
			petMessage += `\n\nYou set a new global record for the **luckiest** ${pet.name} pet!`;
			if (lowest) petMessage += ` The previous record was ${lowest}.`;
		} else if (!highest || count > highest) {
			petRecords.highest[pet.id] = count;
			this.client.settings.update('petRecords', { ...petRecords });
			petMessage += `\n\nYou set a new global record for the **unluckiest** ${pet.name} pet!`;
			if (highest) petMessage += ` The previous record was ${highest}.`;
		}

		return msg.send(petMessage);
	}

};
