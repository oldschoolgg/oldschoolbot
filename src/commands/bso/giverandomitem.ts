import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';

import { Channel } from '../../lib/constants';
import { BotCommand } from '../../lib/structures/BotCommand';
import { isSuperUntradeable, itemNameFromID } from '../../lib/util';

const options = {
	max: 1,
	time: 10_000,
	errors: ['time']
};

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 10,
			usage: '<user:user>',
			oneAtTime: true,
			categoryFlags: ['minion'],
			aliases: ['gri'],
			restrictedChannels: [Channel.General, Channel.BSOChannel, Channel.BSOGeneral, Channel.BSOGambling]
		});
	}

	async run(msg: KlasaMessage, [user]: [KlasaUser]) {
		if (user.bot || user === msg.author) return;

		if (msg.author.isIronman || user.isIronman) return;

		if (!msg.flagArgs.confirm && !msg.flagArgs.cf) {
			const sellMsg = await msg.channel.send(
				`Are you sure you want to give a random stack of items from your bank to ${user.username}? Please type \`yes\` to confirm.`
			);

			try {
				await msg.channel.awaitMessages({
					...options,
					filter: _msg => _msg.author.id === msg.author.id && _msg.content.toLowerCase() === 'yes'
				});
			} catch (err) {
				return sellMsg.edit('Cancelling.');
			}
		}

		await msg.author.settings.sync(true);
		const bank = msg.author.bank();
		const item = bank.random();
		if (!item) return msg.channel.send('No items found.');
		if (isSuperUntradeable(item.id)) {
			return msg.channel.send(`You can't give away your ${itemNameFromID(item.id)}!`);
		}
		if (!item) return msg.channel.send('You have no items!');
		await msg.author.removeItemFromBank(item.id, item.qty);
		await user.addItemsToBank({ [item.id]: item.qty }, false, false);

		return msg.channel.send(
			`You gave ${item.qty.toLocaleString()}x ${itemNameFromID(item.id)} to ${user.username}.`
		);
	}
}
