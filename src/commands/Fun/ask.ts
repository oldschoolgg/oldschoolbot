import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { randomItemFromArray } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: `Allows you to ask yes/no questions to the bot.`,
			examples: [
				'+ask Should I try to get an inferno cape?',
				'+ask Should I become a patron?'
			]
		});
	}

	async run(msg: KlasaMessage) {
		return msg.send(
			randomItemFromArray([
				'Yes.',
				'Definitely.',
				'Obviously yes.',
				'Without a doubt.',
				'I think so.',
				'100%.',

				"It's possible.",
				'Maybe.',

				'No.',
				'No chance.',
				'Unlikely.',
				'0 chance.',
				'No way.'
			])
		);
	}
}
