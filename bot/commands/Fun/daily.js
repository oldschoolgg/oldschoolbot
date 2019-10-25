const { Command } = require('klasa');

const { triviaQuestions } = require('../../../resources/trivia-questions');
const oneDay = 1000 * 60 * 60 * 24;

const easyTrivia = triviaQuestions.slice(0, 30);

const options = {
	max: 1,
	time: 10000,
	errors: ['time']
};

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			cooldown: 1
		});
		this.cache = new Set();
	}

	async run(msg) {
		if (this.cache.has(msg.author.id)) return;
		this.cache.add(msg.author.id);

		await msg.author.settings.sync();
		const currentDate = new Date().getTime();
		const lastVoteDate = msg.author.settings.get('lastDailyTimestamp');
		const difference = currentDate - lastVoteDate;

		if (difference >= oneDay) {
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
				if (winner) await this.client.tasks.get('daily').run(msg.author, true);
				msg.channel.send(`Correct! You've received your daily reward.`);
			} catch (err) {
				await this.client.tasks.get('daily').run(msg.author, false);
				msg.channel.send(
					`You didn't answer correctly, and only received 50% of your normal amount of GP.`
				);
			}
			this.cache.delete(msg.author.id);
		} else {
			const nextVoteDate = lastVoteDate + oneDay;
			const timeUntilDate = nextVoteDate - currentDate;
			this.cache.delete(msg.author.id);
			return msg.send(
				`You can claim your next daily in ${(timeUntilDate / 1000 / 60 / 60).toFixed(
					2
				)} hours.`
			);
		}
	}
};
