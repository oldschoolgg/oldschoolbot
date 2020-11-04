import fs from 'fs';
import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';

let triviaQuestions: any;
try {
	// eslint-disable-next-line prefer-destructuring
	triviaQuestions = JSON.parse(
		fs.readFileSync('./src/lib/resources/trivia-questions.json').toString()
	).triviaQuestions;
} catch (err) {
	console.log('No trivia questions file found. Disabling trivia command.');
}

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['t'],
			description: 'Sends a OSRS related trivia question.'
		});
	}

	async init() {
		if (!triviaQuestions) this.disable();
	}

	async run(msg: KlasaMessage) {
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
				{
					max: 1,
					time: 30000,
					errors: ['time']
				}
			);
			const winner = collected.first()!;
			return msg.channel.send(
				`<:RSTickBox:381462594734522372> ${winner.author} had the right answer with \`${winner.content}\`!`
			);
		} catch (err) {
			return msg.channel.send('<:RSXBox:381462594961014794> Nobody answered correctly.');
		}
	}

	findNewTrivia(_triviaQuestionsDone: any[]): any {
		const index = Math.floor(Math.random() * triviaQuestions.length);
		if (!_triviaQuestionsDone.includes(index)) {
			return [triviaQuestions[index], index];
		}
		return this.findNewTrivia(_triviaQuestionsDone);
	}
}
