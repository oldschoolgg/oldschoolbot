import { KlasaMessage, CommandStore } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import getOSItem from '../../lib/util/getOSItem';
import { Emoji } from '../../lib/constants';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			usage: '<number:int{1,100}> <itemname:...string>',
			usageDelim: ' ',
			oneAtTime: true
		});
	}

	async run(msg: KlasaMessage, [qty, itemName]: [number, number]) {
		const osItem = getOSItem(itemName);
		await msg.author.addItemsToBank({ [osItem.id]: qty });
		for (const setup of ['range', 'melee', 'mage']) {
			if (msg.flagArgs[setup]) {
				try {
					await this.client.commands.get('equip')!.run(msg, [setup, 1, osItem.name]);
					return msg.send(`Equipped 1x ${osItem.name} to your ${setup} setup.`);
				} catch (err) {
					return msg.send(`Failed to equip item. Equip it yourself ${Emoji.PeepoNoob}`);
				}
			}
		}

		return msg.send(`Gave you ${qty}x ${osItem.name}.`);
	}
}
