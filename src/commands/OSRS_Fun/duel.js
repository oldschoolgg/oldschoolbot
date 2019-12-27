const {
	Command,
	util: { sleep }
} = require('klasa');
const { User } = require('discord.js');
const {
	Util: { toKMB }
} = require('oldschooljs');

const { roll } = require('../../../config/util');

const options = {
	max: 1,
	time: 15000,
	errors: ['time']
};

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			description: 'Simulates dueling another player.',
			usage: '<user:user|user:str> [amount:int{10000}]',
			usageDelim: ' ',
			cooldown: 5
		});
		this.cache = new Set();
	}

	async checkBal(user, amount) {
		await user.settings.sync(true);
		return user.settings.get('GP') >= amount;
	}

	async run(msg, [user, amount]) {
		if (!amount) {
			return msg.send(
				`${Math.random() >= 0.5 ? msg.author : user} won the duel with ${Math.floor(
					Math.random() * 30 + 1
				)} HP remaining.`
			);
		}

		if (!(user instanceof User)) throw `You didn't mention a user to duel.`;

		if (this.cache.has(msg.guild.id)) return;

		if (!(await this.checkBal(msg.author, amount))) {
			return msg.send('You dont have have enough GP to duel that much.');
		}
		if (!(await this.checkBal(user, amount))) {
			return msg.send('That person doesnt have enough GP to duel that much.');
		}

		this.cache.add(msg.guild.id);

		const duelMsg = await msg.channel.send(
			`${user.username}, say \`yes\` if you accept the duel for ${toKMB(amount)} GP.`
		);
		try {
			const collected = await msg.channel.awaitMessages(
				_msg => _msg.author.id === user.id && _msg.content.toLowerCase() === 'yes',
				options
			);
			if (!collected || !collected.first()) {
				this.cache.delete(msg.guild.id);
				throw "This shouldn't be possible...";
			}
		} catch (err) {
			this.cache.delete(msg.guild.id);
			return duelMsg.edit(`The user didn't accept the duel.`);
		}

		if (!(await this.checkBal(msg.author, amount)) || !(await this.checkBal(user, amount))) {
			this.cache.delete(msg.guild.id);
			return msg.send('<:bpaptu:647580762098368523>');
		}

		await msg.author.settings.update('GP', msg.author.settings.get('GP') - amount);
		await user.settings.update('GP', user.settings.get('GP') - amount);

		await duelMsg.edit(`${user.username} accepted the duel. You both enter the duel arena...`);

		await sleep(2000);
		await duelMsg.edit(`${user.username} and ${msg.author.username} begin fighting...`);

		let winner;

		// Rare events which force the winner/loser to a certain side.
		if (roll(300)) {
			await sleep(2000);
			await duelMsg.edit(
				`Oh no... ${msg.author.username} enabled food and is scamming ${user.username}...`
			);
			await sleep(1000);

			winner = msg.author;
		} else if (roll(300)) {
			await sleep(2000);
			await duelMsg.edit(
				`Oops... looks like ${msg.author.username} forgot to check their whip, it just ran out of charges and broke...`
			);
			await sleep(1000);
			winner = user;
		}

		await sleep(2000);
		await duelMsg.edit(`The fight is almost over...`);
		await sleep(2000);

		// If a rare event didn't occur, pick a random winner.
		if (!winner) {
			winner = Math.random() > 0.5 ? user : msg.author;
		}

		const winningAmount = parseInt(amount * 2);
		const tax = winningAmount - parseInt(winningAmount * 0.95);

		await winner.settings.update('GP', winner.settings.get('GP') + (winningAmount - tax));

		const gpImage = this.client.commands.get('bank').generateImage(winningAmount);
		this.cache.delete(msg.guild.id);
		return msg.channel.send(
			`Congratulations ${winner.username}! You won ${toKMB(winningAmount)}, and paid ${toKMB(
				tax
			)} tax.`,
			gpImage
		);
	}
};
