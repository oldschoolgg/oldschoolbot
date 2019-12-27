const { Command } = require('klasa');

let triviaQuestions;
try {
	// eslint-disable-next-line prefer-destructuring
	triviaQuestions = require('../../../resources/trivia-questions').triviaQuestions;
} catch (err) {
	console.log('No trivia questions file found. Disabling trivia command.');
}

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			aliases: ['t'],
			description: 'Sends a OSRS related trivia question.'
		});
	}

	async init() {
		if (!triviaQuestions) this.disable();
	}

	async run(msg) {
		if (
			!msg.channel.__triviaQuestionsDone ||
			msg.channel.__triviaQuestionsDone.length === triviaQuestions.length
		) {
			msg.channel.__triviaQuestionsDone = [];
		}

		const [item, index] = this.findNewTrivia(msg.channel.__triviaQuestionsDone);
		msg.channel.__triviaQuestionsDone.push(index);
		await msg.send(item.q);
		try {
			const collected = await msg.channel.awaitMessages(
				answer => item.a.includes(answer.content.toLowerCase()),
				options
			);
			const winner = collected.first();
			return msg.channel.send(
				`<:RSTickBox:381462594734522372> ${winner.author} had the right answer with \`${winner.content}\`!`
			);
		} catch (err) {
			return msg.channel.send('<:RSXBox:381462594961014794> Nobody answered correctly.');
		}
	}

	findNewTrivia(_triviaQuestionsDone) {
		const index = Math.floor(Math.random() * triviaQuestions.length);
		if (!_triviaQuestionsDone.includes(index)) {
			return [triviaQuestions[index], index];
		} else {
			return this.findNewTrivia(_triviaQuestionsDone);
		}
	}
};

const options = {
	max: 1,
	time: 30000,
	errors: ['time']
};
