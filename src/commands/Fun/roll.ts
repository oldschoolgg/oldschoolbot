import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Roll a random number between 1-100, or up to a provided number.',
			usage: '[max:int{2,10000000}]'
		});
	}

	async run(msg: KlasaMessage, [max]: [number]) {
		return msg.send((Math.floor(Math.random() * max) + 1).toLocaleString());
	}
}
