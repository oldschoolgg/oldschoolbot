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
			throw `You have no pets yet.

You can get pets in 2 ways:
1. Talking in a server which has petmessages enabled. (\`+petmessages enable\`)
2. Voting, when you vote you get a chance at *every* pet. (\`+vote\`)

Want to disable Pet Messages in this server? Type \`${msg.guild.settings.get('prefix')}petmessages disable\``;
		}

		const formatted = [];
		Object
			.keys(userPets)
			.map(id => {
				id = parseInt(id);
				const pet = pets.find(_pet => _pet.id === id);
				return formatted.push(`${pet.emoji} ${pet.name}: ${userPets[id]}`);
			});

		return msg.send(formatted.join('\n'));
	}

};
