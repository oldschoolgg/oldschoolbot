import { KlasaMessage, CommandStore } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { addBanks } from 'oldschooljs/dist/util';
import { removeBankFromBank } from '../../lib/util';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
import { ItemBank } from '../../lib/types';
import { ItemList } from '../../lib/minions/types';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 4,
			usage: '<item:...itemList>',
			usageDelim: ' ',
			oneAtTime: true
		});
	}

	async run(msg: KlasaMessage, [items]: [ItemList[]]) {
		await msg.author.settings.sync(true);
		const userBank = msg.author.settings.get(UserSettings.Bank);

		let cantDropItems: ItemBank = {};
		let itemsToDrop: ItemBank = {};

		for (const item of items) {
			const osItem = item.possibilities.find(
				i => userBank[i.id] && (!itemsToDrop[i.id] || !itemsToDrop[i.id])
			);
			const itemQTY = !item.qtyInformed && osItem ? userBank[osItem.id] : item.qty;
			if (!osItem || userBank[osItem.id] < itemQTY) {
				cantDropItems = addBanks([cantDropItems, { [item.possibilities[0].id]: itemQTY }]);
			} else {
				itemsToDrop = addBanks([itemsToDrop, { [osItem.id]: itemQTY }]);
			}
		}

		if (Object.entries(cantDropItems).length > 0) {
			throw `You don't own some of the items you are trying to drop. Make sure you have **${await createReadableItemListFromBank(
				this.client,
				cantDropItems
			)}** on your bank.`;
		}

		const toDropString = await createReadableItemListFromBank(this.client, itemsToDrop);

		if (!msg.flagArgs.confirm && !msg.flagArgs.cf) {
			const dropMsg = await msg.channel.send(
				`${msg.author}, are you sure you want to drop **${toDropString}**? This is irreversible, and you will lose the items permanently. Type \`drop\` to confirm.`
			);

			try {
				await msg.channel.awaitMessages(
					_msg =>
						_msg.author.id === msg.author.id && _msg.content.toLowerCase() === 'drop',
					{
						max: 1,
						time: 10000,
						errors: ['time']
					}
				);
			} catch (err) {
				return dropMsg.edit(`Cancelling drop of **${toDropString}**.`);
			}
		}
		await msg.author.settings.update(
			UserSettings.Bank,
			addBanks([removeBankFromBank(userBank, itemsToDrop)])
		);
		msg.author.log(
			`dropped Quantity[${Object.values(itemsToDrop)
				.map(qty => `${qty}`)
				.join(',')}] ItemID[${Object.keys(itemsToDrop)
				.map(id => `${id}`)
				.join(',')}]`
		);
		return msg.send(`Dropped ${toDropString}.`);
	}
}
