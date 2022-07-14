import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';

import { getRandomTriviaQuestion } from '../../lib/roboChimp';
import { BotCommand } from '../../lib/structures/BotCommand';
import { stringMatches } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['t'],
			description: 'Sends a OSRS related trivia question.',
			examples: ['+t'],
			categoryFlags: ['fun'],
			usage: '[user:user]'
		});
	}

	async run(msg: KlasaMessage, [user]: [KlasaUser | undefined]) {
		const triviaDuelUsers: [KlasaUser, KlasaUser] | null = user === undefined ? null : [msg.author, user];

		const { question, answers } = await getRandomTriviaQuestion();
		await msg.channel.send(
			triviaDuelUsers === null
				? question
				: `**Trivia Duel between ${msg.author.username} and ${user!.username}:** ${question}`
		);
		try {
			const collected = await msg.channel.awaitMessages({
				max: 1,
				time: 30_000,
				errors: ['time'],
				filter: answer => {
					if (!answers.some(i => stringMatches(answer.content, i))) return false;
					if (triviaDuelUsers) {
						return triviaDuelUsers.includes(answer.author);
					}
					return true;
				}
			});
			const winner = collected.first()!;
			if (triviaDuelUsers) {
				return msg.channel.send(`${winner.author} won the trivia duel with \`${winner.content}\`!`);
			}
			return msg.channel.send(`${winner.author} had the right answer with \`${winner.content}\`!`);
		} catch (err) {
			return msg.channel.send('Nobody answered correctly.');
		}
	}
}
