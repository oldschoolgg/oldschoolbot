const { Monitor } = require('klasa');
const pets = require('../../data/pets');

module.exports = class extends Monitor {

	constructor(...args) {
		super(...args, { ignoreOthers: false, enabled: true });
	}

	/* eslint-disable consistent-return */
	async run(msg) {
		if (!msg.guild.settings.get('petchannel')) return;
		if (!msg.channel.permissionsFor(this.client.user).has('SEND_MESSAGES')) return;

		if (!roll(5)) return;
		if (!this.client.dbl || !this.client.dbl.hasVoted) return;
		if (!roll(this.client.dbl.hasVoted(msg.author.id) ? 2 : 5)) return;

		const pet = pets[Math.floor(Math.random() * pets.length)];
		if (roll(pet.chance)) {
			const userPets = msg.author.settings.get('pets');
			if (!userPets[pet.id]) userPets[pet.id] = 1;
			else userPets[pet.id]++;

			msg.author.settings.update('pets', { ...userPets });
			if (userPets[pet.id] > 1) {
				return msg.channel.send(`${msg.author} has a funny feeling like they would have been followed.`);
			} else {
				msg.channel.send(`${msg.author} just got the **${pet.name}** pet! ${pet.emoji}
Type \`${msg.guild.settings.get('prefix')}mypets\` to see your pets.`);
			}
		}
	}

};

function roll(max) {
	return Math.floor((Math.random() * max) + 1) === 1;
}
