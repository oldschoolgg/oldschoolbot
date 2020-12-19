import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { itemID } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<user:user>',
			permissionLevel: 10
		});
	}

	async run(msg: KlasaMessage, [user]: [KlasaUser]) {
		await user.addItemsToBank({ [itemID('Tester gift box')]: 1 });
		return msg.channel.send(`Gave 1x Tester gift box to ${user.username}.`);
	}
}
