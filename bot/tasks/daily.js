const { Task } = require('klasa');

const pets = require('../../data/pets');
const { roll } = require('../../config/util');

module.exports = class extends Task {
	async run(user, triviaCorrect) {
		console.log(triviaCorrect);
		const member = await this.client.guilds
			.get('342983479501389826')
			.members.fetch(user)
			.catch(() => null);

		let amount = Math.floor(Math.random() * 5000000) + 500000;
		let bonuses = '';

		const currentDate = new Date();
		if (currentDate.getDay() === 6 || currentDate.getDay() === 0) {
			amount *= 2;
			bonuses += '<:MoneyBag:493286312854683654>';
		}

		if (member) {
			amount = Math.floor(amount * 1.5);
			bonuses += ' <:OSBot:601768469905801226>';
		}

		if (roll(10000)) {
			amount += 1000000000;
		}

		if (!triviaCorrect) {
			amount = Math.floor(amount * 0.2);
		}

		let chStr = `${bonuses} ${
			user.username
		} just got their daily and received ${amount.toLocaleString()} GP! <:Smiley:420283725469974529>`;
		let dmStr = `${bonuses} You received ${amount.toLocaleString()} GP.`;

		if (triviaCorrect && roll(8)) {
			const pet = pets[Math.floor(Math.random() * pets.length)];
			const userPets = user.settings.get('pets');
			if (!userPets[pet.id]) userPets[pet.id] = 1;
			else userPets[pet.id]++;

			user.settings.update('pets', { ...userPets });

			chStr += `\nThey also received the **${pet.name}** pet! ${pet.emoji}`;
			dmStr += `\nYou also received the **${pet.name}** pet! ${pet.emoji}`;
		}

		this.client.channels.get('357422607982919680').send(chStr);
		user.send(dmStr).catch(() => null);
		user.settings.update('GP', user.settings.get('GP') + amount);
	}
};
