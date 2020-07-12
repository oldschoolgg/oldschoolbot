import { KlasaMessage, CommandStore } from 'klasa';
import { BotCommand } from '../../lib/BotCommand';
import getOSItem from '../../lib/util/getOSItem';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[qty:int{1,10000000}|name:...string] [id:int{1,10000000}|name:...string]',
			usageDelim: ' '
		});
	}

	async run(msg: KlasaMessage, [qty, itemName = '']: [number | string, string | number]) {
		if (typeof qty === 'string') {
			itemName = qty; 
			const osItem = await getOSItem(itemName);
			await msg.author.addItemsToBank({ [osItem.id]: 1 });
			return msg.send(`Gave you 1x ${osItem.name}.`);
		}
		if (typeof itemName === 'number') {
			const osItem = await getOSItem(itemName);
			await msg.author.addItemsToBank({ [osItem.id]: qty });
			return msg.send(`Gave you ${qty}x ${osItem.name}.`);
		}
		if (typeof itemName === 'string') {
			const osItem = await getOSItem(itemName);
			await msg.author.addItemsToBank({ [osItem.id]: qty });
			return msg.send(`Gave you ${qty}x ${osItem.name}.`);
		}
		else {
		return msg.send(`Gave you no items.`);
		}
	}
}