const { Command } = require('klasa');
const pets = require('../../../data/pets');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			description: 'View the virtual pets you have.',
			cooldown: 3
		});
	}

	async run(msg) {
		const userPets = msg.author.settings.get('pets');
		if (Object.keys(userPets).length === 0) {
			return msg.sendLocale('NO_PETS', [msg.guild.settings.get('prefix')]);
		}

		const formatted = [];
		Object.keys(userPets).map(id => {
			id = parseInt(id);
			const pet = pets.find(_pet => _pet.id === id);
			return formatted.push(`${pet.emoji} ${pet.name}: ${userPets[id]}`);
		});

		return msg.send(formatted.join('\n'), { split: true });
	}
};
