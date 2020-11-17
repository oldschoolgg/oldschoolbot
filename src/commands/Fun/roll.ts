import { randInt } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Roll a random number between 1-100, or up to a provided number.',
			examples: ['+roll', '+roll 6'],
			usage: '[max:int{2,10000000}]',
			categoryFlags: ['utility']
		});
	}

	async run(msg: KlasaMessage, [max = 100]: [number]) {
		return msg.send(randInt(1, max));
	}
}
