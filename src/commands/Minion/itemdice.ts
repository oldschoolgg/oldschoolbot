import { KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { itemNameFromID, addItemToBank, removeBankFromBank } from '../../lib/util';

export default class extends BotCommand {
	async run(msg: KlasaMessage) {
		const userBank = msg.author.settings.get(UserSettings.Bank);
		const bank = Object.keys(userBank);
		if (bank.length < 56) throw `You need at least 1 full bank page to do this command.`;

		const item1 = bank[Math.floor(Math.random() * bank.length)];
		const itemsOwned1 = msg.author.numItemsInBankSync(parseInt(item1));
		const item2 = bank[Math.floor(Math.random() * bank.length)];
		const itemsOwned2 = msg.author.numItemsInBankSync(parseInt(item2));

		if (Math.random() > 0.5) {
			const newBank = addItemToBank(userBank, parseInt(item1), itemsOwned1);
			await msg.author.settings.update(UserSettings.Bank, newBank);
			return msg.send(`You've received ${itemsOwned1}x ${itemNameFromID(parseInt(item1))}`);
		}

		const lostItems = {
			[parseInt(item1)]: itemsOwned1,
			[parseInt(item2)]: itemsOwned2
		};
		await msg.author.settings.update(
			UserSettings.Bank,
			removeBankFromBank(userBank, lostItems)
		);

		return msg.send(
			`You've lost ${itemsOwned1}x ${itemNameFromID(
				parseInt(item1)
			)}, and ${itemsOwned2}x ${itemNameFromID(parseInt(item2))}.`
		);
	}
}
