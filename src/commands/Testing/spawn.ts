import { CommandStore, KlasaMessage } from 'klasa';
import { Item } from 'oldschooljs/dist/meta/types';

import { BotCommand } from '../../lib/BotCommand';
import { Emoji } from '../../lib/constants';
import { ItemBank } from '../../lib/types';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			usage: '[qty:integer{1,1000000}] (item:...item)',
			usageDelim: ' ',
			oneAtTime: true,
			testingCommand: true,
			categoryFlags: ['hidden']
		});
		this.enabled = !this.client.production;
	}

	async run(msg: KlasaMessage, [qty = 1, itemArray]: [number, Item[]]) {
		if (msg.flagArgs.all) {
			const items: ItemBank = {};
			for (const item of itemArray) {
				items[item.id] = qty;
			}
			await msg.author.addItemsToBank(items);
			const itemsString = await createReadableItemListFromBank(this.client, items);
			return msg.send(`Gave you ${itemsString}.`);
		}

		const osItem = itemArray[0];
		await msg.author.addItemsToBank({ [osItem.id]: qty });

		for (const setup of ['range', 'melee', 'mage', 'skilling']) {
			if (msg.flagArgs[setup]) {
				try {
					await this.client.commands.get('equip')!.run(msg, [setup, 1, [osItem]]);
					return msg.send(`Equipped 1x ${osItem.name} to your ${setup} setup.`);
				} catch (err) {
					return msg.send(`Failed to equip item. Equip it yourself ${Emoji.PeepoNoob}`);
				}
			}
		}

		return msg.send(`Gave you ${qty}x ${osItem.name}.`);
	}
}
