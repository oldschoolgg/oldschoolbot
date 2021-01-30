import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '[quantity:int{1}|name:...string] [name:...string]',
			usageDelim: ' ',
			description: 'Sends your minion to kill monsters.',
			examples: ['+k vorkath', '+k skeleton'],
			categoryFlags: ['minion', 'pvm']
		});
	}

	async run(msg: KlasaMessage, [quantity, name = '']: [string | number, string]) {
		return this.client.commands
			.get('minion')!
			.kill(msg, [quantity, name])
			.catch(err => {
				return msg.send(err);
			});
	}
}
