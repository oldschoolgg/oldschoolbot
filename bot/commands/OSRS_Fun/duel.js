const {
	Command,
	util: { sleep }
} = require('klasa');
const { User } = require('discord.js');
const {
	Util: { toKMB, fromKMB }
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
			usage: '<user:user|user:str> [amount:int{10000,2147483647}]',
			usageDelim: ' ',
			cooldown: 5
		});
		this.cache = new Set();
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

		try {
			await msg.author.settings.sync(true);
			await user.settings.sync(true);
		} catch (err) {
			return msg.send('Unexpected error.');
		}

		const giverGP = msg.author.settings.get('GP');
		const takerGP = user.settings.get('GP');

		if (giverGP < amount) return msg.send('You dont have have enough GP to duel that much.');
		if (takerGP < amount) {
			return msg.send('That person doesnt have enough GP to duel that much.');
		}

		const duelMsg = await msg.channel.send(
			`${user.username}, say \`yes\` if you accept the duel for ${toKMB(amount)} GP.`
		);
		try {
			this.cache.add(msg.guild.id);
			const collected = await msg.channel.awaitMessages(
				_msg => _msg.author.id === user.id && _msg.content.toLowerCase() === 'yes',
				options
			);
			if (!collected || !collected.first()) {
				throw 'didnt accept';
			}
		} catch (err) {
			this.cache.delete(msg.guild.id);
			return duelMsg.edit(`The user didn't accept the duel.`);
		}

		await duelMsg.edit(`${user.username} accepted the duel. You both enter the duel arena...`);

		await sleep(2000);
		await duelMsg.edit(`${user.username} and ${msg.author.username} begin fighting...`);

		let winner;
		let loser;

		// Rare events which force the winner/loser to a certain side.
		if (roll(300)) {
			await sleep(2000);
			await duelMsg.edit(
				`Oh no... ${msg.author.username} enabled food and is scamming ${user.username}...`
			);
			await sleep(1000);

			winner = msg.author;
			loser = user;
		} else if (roll(300)) {
			await sleep(2000);
			await duelMsg.edit(
				`Oops... looks like ${user.username}'s forgot to check their whip, it just ran out of charges and broke...`
			);
			await sleep(1000);
			loser = msg.author;
			winner = user;
		}

		await sleep(2000);
		await duelMsg.edit(`The fight is almost over...`);

		await sleep(2000);
		const [newWinner, newLoser] = Math.random() > 0.5 ? [user, msg.author] : [msg.author, user];
		// If a rare event didn't occur, pick a random winner.
		if (!winner) {
			winner = newWinner;
			loser = newLoser;
		}

		const winningAmount = parseInt(amount * 2);
		let tax = winningAmount - parseInt(winningAmount * 0.95);

		if (winningAmount >= fromKMB('100m')) {
			tax *= 1.5;
		}

		await winner.settings.update('GP', winner.settings.get('GP') + (amount - tax));
		await loser.settings.update('GP', loser.settings.get('GP') - amount);

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
