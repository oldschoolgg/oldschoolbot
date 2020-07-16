import { KlasaMessage, CommandStore } from 'klasa';
import { Items } from 'oldschooljs';

import { BotCommand } from '../../lib/BotCommand';
import { stringMatches } from '../../lib/util';
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
			usage: '<quantity:int{1}> <itemname:...string>',
			usageDelim: ' ',
			oneAtTime: true
		});
	}

	async run(msg: KlasaMessage, [quantity, itemName]: [number, string]) {
		const userBank = msg.author.settings.get(UserSettings.Bank);
		const osItem = Items.find(i => stringMatches(itemName, i.name) && Boolean(userBank[i.id]));

		if (!osItem) {
			throw `I couldn't find any items matching this name that you own.`;
		}

		const hasItem = await msg.author.hasItem(osItem.id, quantity, false);
		if (!hasItem) {
			throw `You don't have ${quantity}x ${osItem.name}.`;
		}

		if (!msg.flagArgs.confirm && !msg.flagArgs.cf) {
			const dropMsg = await msg.channel.send(
				`${msg.author}, are you sure you want to drop ${quantity}x ${osItem.name}? This is irreversible, and you will lose the items permanently. Type \`drop\` to confirm.`
			);

			try {
				await msg.channel.awaitMessages(
					_msg => _msg.author.id === msg.author.id && _msg.content.toLowerCase() === 'drop',
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
