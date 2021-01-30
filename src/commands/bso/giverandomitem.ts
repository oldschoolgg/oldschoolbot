import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';

import { BotCommand } from '../../lib/structures/BotCommand';
import { itemNameFromID } from '../../lib/util';

const options = {
	max: 1,
	time: 10000,
	errors: ['time']
};

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 30,
			usage: '<user:user>',
			oneAtTime: true,
			categoryFlags: ['minion'],
			aliases: ['gri'],
			restrictedChannels: [
				'342983479501389826',
				'732207379818479756',
				'792691343284764693',
				'792692390778896424'
			]
		});
	}

	async run(msg: KlasaMessage, [user]: [KlasaUser]) {
		if (user.bot || user === msg.author) return;
		if (!msg.flagArgs.confirm && !msg.flagArgs.cf) {
			const sellMsg = await msg.channel.send(
				`Are you sure you want to give a random stack of items from your bank to ${user.username}? Please type \`yes\` to confirm.`
			);

			try {
				await msg.channel.awaitMessages(
					_msg =>
						_msg.author.id === msg.author.id && _msg.content.toLowerCase() === 'yes',
					options
				);
			} catch (err) {
				return sellMsg.edit(`Cancelling.`);
			}
		}

		await msg.author.settings.sync(true);
		const bank = msg.author.bank();
		const item = bank.random();
		if (!item) return msg.send(`You have no items!`);
		await msg.author.removeItemFromBank(item.id, item.qty);
		await user.addItemsToBank({ [item.id]: item.qty });

		return msg.send(
			`You gave ${item.qty.toLocaleString()}x ${itemNameFromID(item.id)} to ${user.username}.`
		);
	}
}
