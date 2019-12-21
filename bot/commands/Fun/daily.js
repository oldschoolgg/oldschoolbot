const { Command, Duration } = require('klasa');

const { roll } = require('../../../config/util');
const { triviaQuestions } = require('../../../resources/trivia-questions');
const halfDay = 1000 * 60 * 60 * 12;

const easyTrivia = triviaQuestions.slice(0, 40);

const options = {
	max: 1,
	time: 13000,
	errors: ['time']
};

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			cooldown: 5
		});
		this.cache = new Set();
	}

	async run(msg) {
		const donationMessage = `Old School Bot is in huge need for donations for server costs. Please consider joining the support server (${
			msg.guild ? msg.guild.settings.prefix : '+'
		}support) if you're able to help.\n`;

		const shouldShow = roll(3);

		if (this.cache.has(msg.author.id)) return;
		this.cache.add(msg.author.id);

		await msg.author.settings.sync();
		const currentDate = new Date().getTime();
		const lastVoteDate = msg.author.settings.get('lastDailyTimestamp');
		const difference = currentDate - lastVoteDate;

		if (difference >= halfDay) {
			await msg.author.settings.update('lastDailyTimestamp', currentDate);

			const trivia = easyTrivia[Math.floor(Math.random() * easyTrivia.length)];

			await msg.channel.send(`**Daily Trivia:** ${trivia.q}`);
			try {
				const collected = await msg.channel.awaitMessages(
					answer =>
						answer.author.id === msg.author.id &&
						trivia.a.includes(answer.content.toLowerCase()),
					options
				);
				const winner = collected.first();
				if (winner) await this.client.tasks.get('daily').run(msg, true);
			} catch (err) {
				await this.client.tasks.get('daily').run(msg, false);
			}
			this.cache.delete(msg.author.id);
		} else {
			this.cache.delete(msg.author.id);

			const nextVoteDate = lastVoteDate + halfDay;
			const duration = Duration.toNow(nextVoteDate);

			return msg.send(
				`${shouldShow ? donationMessage : ''} You can claim your next daily in ${duration}.`
			);
		}
	}
};
