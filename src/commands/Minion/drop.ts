import { CommandStore, KlasaMessage } from 'klasa';

import ClueTiers from '../../lib/minions/data/clueTiers';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { itemNameFromID, updateBankSetting } from '../../lib/util';
import { parseBank } from '../../lib/util/parseStringBank';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 3,
			usage: '<bank:...str>',
			usageDelim: ' ',
			oneAtTime: true,
			categoryFlags: ['minion'],
			description: 'Drops an item from your bank.',
			examples: ['+drop 1 elysian sigil', '+drop bronze dagger']
		});
	}

	async run(msg: KlasaMessage, [bankStr]: [string]) {
		const bank = parseBank({ inputStr: bankStr, inputBank: msg.author.bank(), flags: msg.flagArgs });

		if (!msg.author.owns(bank)) {
			return msg.channel.send(`You don't own ${bank}.`);
		}

		await msg.confirm(
			`${msg.author}, are you sure you want to drop ${bank}? This is irreversible, and you will lose the items permanently.`
		);

		const favs = msg.author.settings.get(UserSettings.FavoriteItems);
		let itemsToDoubleCheck = [
			...favs,
			...ClueTiers.map(c => [c.id, c.scrollID]),
			...msg.author
				.bank()
				.items()
				.filter(([item, quantity]) => item.price * quantity >= 100_000_000)
				.map(i => i[0].id)
		].flat(1);
		const doubleCheckItems = itemsToDoubleCheck.filter(f => bank.has(f));

		if (doubleCheckItems.length > 0) {
			delete msg.flagArgs.cf;
			await msg.confirm(
				`${
					msg.author
				}, some of the items you are dropping look valuable, are you *really* sure you want to drop them? **${doubleCheckItems
					.map(itemNameFromID)
					.join(', ')}**`
			);
		}

		await msg.author.removeItemsFromBank(bank);
		updateBankSetting(this.client, ClientSettings.EconomyStats.DroppedItems, bank);

		return msg.channel.send(`Dropped ${bank}.`);
	}
}
