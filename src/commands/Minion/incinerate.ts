import { KlasaMessage, CommandStore } from 'klasa';
import { Items } from 'oldschooljs';

import { BotCommand } from '../../lib/BotCommand';

const options = {
	max: 1,
	time: 10000,
	errors: ['time']
};

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 4,
			usage: '<quantity:int{1}> <item:int{1}>',
			usageDelim: ' ',
			oneAtTime: true
		});
	}

	async run(msg: KlasaMessage, [quantity, item]: [number, number]) {
		const osItem = Items.get(item);
		if (!osItem) throw `That item doesnt exist.`;

		const hasItem = await msg.author.hasItem(osItem.id, quantity, false);
		if (!hasItem) {
			throw `You don't have ${quantity}x ${osItem.name}.`;
		}

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

		await msg.author.removeItemFromBank(osItem.id, quantity);

		msg.author.log(`dropped Quantity[${quantity}] ItemID[${osItem.id}]`);

		return msg.send(`Dropped ${quantity}x ${osItem.name}.`);
	}
}
