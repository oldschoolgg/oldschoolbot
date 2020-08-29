import { KlasaMessage, CommandStore } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { addBanks } from 'oldschooljs/dist/util';
import {
	bankHasAllItemsFromBank,
	getItemsAndQuantityFromStringList,
	removeBankFromBank
} from '../../lib/util';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 4,
			usage: '(items:...string)',
			usageDelim: ' ',
			oneAtTime: true
		});
	}

	async run(msg: KlasaMessage, [items]: [string]) {
		await msg.author.settings.sync(true);
		const userBank = msg.author.settings.get(UserSettings.Bank);
		const toRemove = await getItemsAndQuantityFromStringList(items, userBank);
		const toDropString = await createReadableItemListFromBank(this.client, toRemove);
		if (!bankHasAllItemsFromBank(userBank, toRemove)) {
			throw `You can't drop what you don't have! Make sure you have **${toDropString}** in your bank!`;
		}
		if (!msg.flagArgs.confirm && !msg.flagArgs.cf) {
			const dropMsg = await msg.channel.send(
				`${msg.author}, are you sure you want to drop ${toDropString}? This is irreversible, and you will lose the items permanently. Type \`drop\` to confirm.`
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
				return dropMsg.edit(`Cancelling drop of ${toDropString}.`);
			}
		}
		await msg.author.settings.update(
			UserSettings.Bank,
			addBanks([removeBankFromBank(userBank, toRemove)])
		);
		msg.author.log(
			`dropped Quantity[${Object.values(toRemove)
				.map(qty => `${qty}`)
				.join(',')}] ItemID[${Object.keys(toRemove)
				.map(id => `${id}`)
				.join(',')}]`
		);
		return msg.send(`Dropped ${toDropString}.`);
	}
}
