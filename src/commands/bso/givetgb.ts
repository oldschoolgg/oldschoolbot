import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';

import { BitField } from '../../lib/constants';
import { BotCommand } from '../../lib/structures/BotCommand';
import { itemID } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<user:user>',
			bitfieldsRequired: [BitField.isContributor]
		});
	}

	async run(msg: KlasaMessage, [user]: [KlasaUser]) {
		if (user.id === msg.author.id) {
			return msg.channel.send("You can't give boxes to yourself!");
		}
		await user.addItemsToBank({ [itemID('Tester gift box')]: 1 });
		return msg.channel.send(`Gave 1x Tester gift box to ${user.username}.`);
	}
}
