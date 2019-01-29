const { Task } = require('klasa');
const pets = require('../../data/pets');

module.exports = class extends Task {

	async run({ user, isWeekend }) {
		const _user = await this.client.users.fetch(user);
		const member = await this.client.guilds
			.get('342983479501389826')
			.members.fetch(user)
			.catch(() => null);

		let amount = Math.floor(Math.random() * 5000000) + 500000;
		let bonuses = '';

		if (isWeekend) {
			amount *= 2;
			bonuses += '<:MoneyBag:493286312854683654>';
		}

		if (member) {
			amount = Math.floor(amount * 1.5);
			bonuses += ' <:OSRSBot:363583286192111616>';
		}

		let chStr = `${bonuses} ${_user.username} just voted for Old School Bot and received ${amount.toLocaleString()} GP! Thank you <:Smiley:420283725469974529>`;
		let dmStr = `${bonuses} Thank you for voting for Old School Bot! You received ${amount.toLocaleString()} GP.`;

		if (roll(5)) {
			const pet = pet[Math.floor(Math.random() * pet.length)];
			const userPets = _user.settings.get('pets');
			if (!userPets[pet.id]) userPets[pet.id] = 1;
			else userPets[pet.id]++;

			_user.settings.update('pets', { ...userPets });

			chStr += `\nThey also received the **${pet.name}** pet! ${pet.emoji}`;
			dmStr += `\nYou also received the **${pet.name}** pet! ${pet.emoji}`;
		}

		this.client.channels.get(this.client.voteLogs).send(chStr);
		_user.send(dmStr).catch(() => null);
		_user.settings.update('GP', _user.settings.get('GP') + amount);
	}

};

function roll(max) {
	return Math.floor((Math.random() * max) + 1) === 1;
}
