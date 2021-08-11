import fs from 'fs';
import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/structures/BotCommand';

let triviaQuestions: any = null;
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
			cooldown: 1,
			oneAtTime: true,
			description: 'Sends a OSRS related trivia question.',
			examples: ['+t'],
			categoryFlags: ['fun']
		});
	}

	async init() {
		if (!triviaQuestions) this.disable();
	}

	async run(msg: KlasaMessage) {
		if (!msg.channel.__triviaQuestionsDone || msg.channel.__triviaQuestionsDone.length === triviaQuestions.length) {
			msg.channel.__triviaQuestionsDone = [];
		}

		const [item, index] = this.findNewTrivia(msg.channel.__triviaQuestionsDone);
		msg.channel.__triviaQuestionsDone.push(index);
		await msg.channel.send(item.q);
		try {
			const collected = await msg.channel.awaitMessages({
				max: 1,
				time: 30_000,
				errors: ['time'],
				filter: answer => item.a.includes(answer.content.toLowerCase())
			});
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
