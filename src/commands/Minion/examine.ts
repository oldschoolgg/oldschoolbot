import { CommandStore, KlasaMessage } from 'klasa';
import { Item } from 'oldschooljs/dist/meta/types';

import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '(item:...item)',
			usageDelim: ' ',
			description: 'Shows the examine text of an item.',
			examples: ['+examine Armadyl godsword', '+examine ash'],
			categoryFlags: ['minion']
		});
	}

	async run(msg: KlasaMessage, [item]: [Item[]]) {
		let message = 'Nothing interesting happens.';
		for (const _item of item) {
			if (_item.examine) {
				message = _item.examine;
			}
		}
		return msg.channel.send(message);
	}
}
