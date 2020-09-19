import { CommandStore, KlasaMessage } from 'klasa';
import { Item } from 'oldschooljs/dist/meta/types';

import { BotCommand } from '../../lib/BotCommand';
import { UserSettings } from '../../lib/settings/types/UserSettings';

const options = {
	max: 1,
	time: 10000,
	errors: ['time']
};

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 4,
			usage: '[quantity:int{1}] (item:...item)',
			usageDelim: ' ',
			oneAtTime: true
		});
	}

	async run(msg: KlasaMessage, [quantity, itemArray]: [number, Item[]]) {
		const userBank = msg.author.settings.get(UserSettings.Bank);
		const osItem = itemArray.find(i => userBank[i.id]);

		if (!osItem) {
			throw `You don't have any of this item to drop!`;
		}

		const numItemsHas = userBank[osItem.id];
		if (!quantity) {
			quantity = numItemsHas;
		}

		if (quantity > numItemsHas) {
			throw `You dont have ${quantity}x ${osItem.name}.`;
		}

		if (!msg.flagArgs.confirm && !msg.flagArgs.cf) {
			const dropMsg = await msg.channel.send(
				`${msg.author}, are you sure you want to drop ${quantity}x ${osItem.name}? This is irreversible, and you will lose the items permanently. Type \`drop\` to confirm.`
			);

			try {
				await msg.channel.awaitMessages(
					_msg =>
						_msg.author.id === msg.author.id && _msg.content.toLowerCase() === 'drop',
					options
				);
			} catch (err) {
				return dropMsg.edit(`Cancelling drop of ${quantity}x ${osItem.name}.`);
			}
		}

		await msg.author.removeItemFromBank(osItem.id, quantity);

		msg.author.log(`dropped Quantity[${quantity}] ItemID[${osItem.id}]`);

		return msg.send(`Dropped ${quantity}x ${osItem.name}.`);
	}
}
