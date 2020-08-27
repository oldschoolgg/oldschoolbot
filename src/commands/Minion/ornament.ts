import { CommandStore, KlasaClient, KlasaMessage } from 'klasa';
import { BotCommand } from '../../lib/BotCommand';
import Ornaments from '../../lib/ornaments';
import {
	addBanks,
	bankHasAllItemsFromBank,
	removeBankFromBank,
	stringMatches
} from '../../lib/util';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { Bank } from '../../lib/types';
import createTupleOfItemsFromBank from '../../lib/util/createTupleOfItemsFromBank';
import getOSItem from '../../lib/util/getOSItem';
import { Time } from '../../lib/constants';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[create|remove] (itemName:...string)',
			usageDelim: ' ',
			oneAtTime: true,
			cooldown: 5,
			altProtection: true
		});
	}

	async createReadableItems(client: KlasaClient, itemBank: Bank) {
		const items = await createTupleOfItemsFromBank(client, itemBank);
		return items
			.map(
				([name, qty]) =>
					`${qty.toLocaleString()}x ${getOSItem(name).wiki_name ?? `WTF-${name}`}`
			)
			.join(', ');
	}

	async run(msg: KlasaMessage, [attach = 'create', itemName]: [string, string]) {
		const ornamentItem = Ornaments.find(i => {
			let realItem = false;
			try {
				realItem = Boolean(getOSItem(itemName));
			} catch (e) {}
			if (
				(i.ornatedItemAliases &&
					i.ornatedItemAliases.some(a => stringMatches(a, itemName))) ||
				(realItem && i.ornatedItem === getOSItem(itemName).id)
			) {
				return i;
			}
		});
		if (!ornamentItem) {
			return msg.send(`${itemName} is not a valid item to ornate.`);
		}
		await msg.author.settings.sync(true);
		const userBank = msg.author.settings.get(UserSettings.Bank);
		const ornamentItemsString = await this.createReadableItems(this.client, {
			[ornamentItem.ornamentName]: 1
		});
		let itemsToRemove;
		let itemsToAdd;
		if (attach === 'create') {
			const baseItemsString = await this.createReadableItems(this.client, {
				[ornamentItem.baseItem]: 1
			});
			if (!bankHasAllItemsFromBank(userBank, { [ornamentItem.baseItem]: 1 })) {
				throw `You don't have the required items to create this item. You need: ${baseItemsString}.`;
			} else if (!bankHasAllItemsFromBank(userBank, { [ornamentItem.ornamentName]: 1 })) {
				throw `You don't have the required items to create this item. You need: ${ornamentItemsString}.`;
			} else {
				itemsToRemove = addBanks([
					{ [ornamentItem.baseItem]: 1 },
					{ [ornamentItem.ornamentName]: 1 }
				]);
				itemsToAdd = { [ornamentItem.ornatedItem]: 1 };
			}
		} else {
			const baseItemsString = await this.createReadableItems(this.client, {
				[ornamentItem.ornatedItem]: 1
			});
			if (!bankHasAllItemsFromBank(userBank, { [ornamentItem.ornatedItem]: 1 })) {
				throw `You don't have the required items to create this item. You need: ${baseItemsString}.`;
			} else {
				itemsToRemove = { [ornamentItem.ornatedItem]: 1 };
				if (ornamentItem.returnOrnament) {
					itemsToAdd = addBanks([
						{ [ornamentItem.baseItem]: 1 },
						{ [ornamentItem.ornamentName]: 1 }
					]);
				} else {
					itemsToAdd = { [ornamentItem.baseItem]: 1 };
				}
			}
		}
		console.log(itemsToAdd, itemsToRemove);
		const itemsToAddString = await this.createReadableItems(this.client, itemsToAdd);
		const itemsToRemoveString = await this.createReadableItems(this.client, itemsToRemove);

		if (!msg.flagArgs.cf && !msg.flagArgs.confirm) {
			const sellMsg = await msg.channel.send(
				`${msg.author}, say \`confirm\` to confirm that you want to create **${itemsToAddString}** using ${itemsToRemoveString}.`
			);

			// Confirm the user wants to create the item(s)
			try {
				await msg.channel.awaitMessages(
					_msg =>
						_msg.author.id === msg.author.id &&
						_msg.content.toLowerCase() === 'confirm',
					{
						max: 1,
						time: Time.Second * 15,
						errors: ['time']
					}
				);
			} catch (err) {
				return sellMsg.edit(`Cancelling item creation.`);
			}
		}
		await msg.author.settings.update(
			UserSettings.Bank,
			addBanks([itemsToAdd, removeBankFromBank(userBank, itemsToRemove)])
		);
		// if (attach === 'remove') await msg.author.addItemsToCollectionLog(itemsToAdd);
		return msg.send(`${itemsToAddString} have been added to your bank.`);
	}
}
