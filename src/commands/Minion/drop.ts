import { CommandStore, KlasaMessage } from 'klasa';
import { Item } from 'oldschooljs/dist/meta/types';

import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 3,
			usage: '[quantity:int{1}] (item:...item)',
			usageDelim: ' ',
			oneAtTime: true,
			categoryFlags: ['minion'],
			description: 'Drops an item from your bank.',
			examples: ['+drop 1 elysian sigil', '+drop bronze dagger']
		});
	}

	async run(msg: KlasaMessage, [quantity, itemArray]: [number, Item[]]) {
		const userBank = msg.author.settings.get(UserSettings.Bank);
		const osItem = itemArray.find(i => userBank[i.id]);

		if (!osItem) {
			return msg.channel.send("You don't have any of this item to drop!");
		}

		const numItemsHas = userBank[osItem.id];
		if (!quantity) {
			quantity = numItemsHas;
		}

		if (quantity > numItemsHas) {
			return msg.channel.send(`You dont have ${quantity}x ${osItem.name}.`);
		}

		await msg.confirm(
			`${msg.author}, are you sure you want to drop ${quantity}x ${osItem.name}? This is irreversible, and you will lose the items permanently.`
		);

		await msg.author.removeItemFromBank(osItem.id, quantity);

		msg.author.log(`dropped Quantity[${quantity}] ItemID[${osItem.id}]`);

		return msg.channel.send(`Dropped ${quantity}x ${osItem.name}.`);
	}
}
