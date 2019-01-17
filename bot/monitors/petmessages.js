const { Monitor } = require('klasa');
const pets = require('../../data/pets');

module.exports = class extends Monitor {

	constructor(...args) {
		super(...args, { ignoreOthers: false, enabled: true });
		this.__memberCache = {};
	}

	/* eslint-disable consistent-return */
	async run(msg) {
		if (!msg.guild.settings.get('petchannel')) return;
		if (!msg.channel.permissionsFor(this.client.user).has('SEND_MESSAGES')) return;

		// If they sent a message in this server in the past 1.5 mins, return.
		const lastMessage = this.__memberCache[`${msg.author.id}.${msg.guild.id}`] || 1;
		if ((Date.now() - lastMessage) < 80000) return;
		this.__memberCache[`${msg.author.id}.${msg.guild.id}`] = Date.now();

		if (!roll(10)) return;
		if (!this.client.dbl || !this.client.dbl.hasVoted) return;
		if (!roll(this.client.dbl.hasVoted(msg.author.id) ? 3 : 10)) return;

		const pet = pets[Math.floor(Math.random() * pets.length)];
		if (roll(Math.max(pet.chance, 900))) {
			const userPets = msg.author.settings.get('pets');
			if (!userPets[pet.id]) userPets[pet.id] = 1;
			else userPets[pet.id]++;

			msg.author.settings.update('pets', { ...userPets });
			if (userPets[pet.id] > 1) {
				msg.channel.send(`${msg.author} has a funny feeling like they would have been followed.`);
			} else {
				msg.channel.send(`${msg.author} just got the **${pet.name}** pet! ${pet.emoji}
Type \`${msg.guild.settings.get('prefix')}mypets\` to see your pets.`);
			}

			this.client.channels.get('469523207691436042')
				.send(`Someone just got the **${pet.name}** pet! ${pet.emoji}`);
		}
	}

};

function roll(max) {
	return Math.floor((Math.random() * max) + 1) === 1;
}
