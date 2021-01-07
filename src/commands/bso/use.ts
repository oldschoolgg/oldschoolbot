import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import getOSItem from '../../lib/util/getOSItem';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<item:string> <item:string>',
			usageDelim: ',',
			oneAtTime: true,
			cooldown: 5,
			altProtection: true
		});
	}

	async run(msg: KlasaMessage, [firstItemStr, secondItemStr]: [string, string]) {
		const bank = msg.author.bank();
		const firstItem = getOSItem(firstItemStr);
		const secondItem = getOSItem(secondItemStr);
		if (!bank.has(firstItem.id)) {
			return msg.send(`You don't have a ${firstItem.name}.`);
		}
		if (!bank.has(secondItem.id)) {
			return msg.send(`You don't have a ${secondItem.name}.`);
		}
		return msg.send(
			`You used ${firstItem.name} on ${secondItem.name}..... Nothing interesting happens.`
		);
	}
}
