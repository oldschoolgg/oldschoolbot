import { KlasaMessage, CommandStore } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import getOSItem from '../../lib/util/getOSItem';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			usage: '[number:int{1,100}] <itemname:...string>',
			usageDelim: ' ',
			oneAtTime: true
		});
		this.enabled = !this.client.production;
	}

	async run(msg: KlasaMessage, [qtyOrName, itemNamePossible]: [number, number | undefined]) {
		// Make 100% sure this command can never be used in prod
		if (
			this.client.production ||
			!this.client.user ||
			this.client.user.id === '303730326692429825'
		) {
			return;
		}

		const qty = typeof qtyOrName === 'number' ? qtyOrName : 1;
		const itemName =
			typeof qtyOrName === 'string' ? qtyOrName : itemNamePossible ?? 'Bunny feet';

		const osItem = getOSItem(itemName);
		await msg.author.addItemsToBank({ [osItem.id]: qty });

		for (const setup of ['range', 'melee', 'mage', 'skilling']) {
			if (msg.flagArgs[setup]) {
				// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
				// @ts-ignore
				return this.client.commands.get('equip').run(msg, [setup, 1, osItem.name]);
			}
		}
		return msg.send(`Gave you ${qty}x ${osItem.name}.`);
	}
}
