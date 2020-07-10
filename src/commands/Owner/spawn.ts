import { KlasaMessage, CommandStore } from 'klasa';
import { BotCommand } from '../../lib/BotCommand';
import getOSItem from '../../lib/util/getOSItem';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[number:int{1,10000000}] <itemname:...string>',
			usageDelim: ' '
		});
	}

	async run(msg: KlasaMessage, [qty = 1, itemName]: [number, string]) {
		const osItem = getOSItem(itemName);
		await msg.author.addItemsToBank({ [osItem.id]: qty });
		return msg.send(`Gave you ${qty}x ${osItem.name}.`);
	}
}
