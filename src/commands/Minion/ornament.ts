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
import { cleanString } from 'oldschooljs/dist/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[create|remove] [quantity:int{1}] <itemName:...string>',
			usageDelim: ' ',
			oneAtTime: true,
			cooldown: 5,
			altProtection: true
		});
	}

	// this exists because some ornated items share the same name as the base item. The only change here was
	// to make the bot first try to get wiki_name, is that doesn't exists, it'll use the default.
	async createReadableItems(client: KlasaClient, itemBank: Bank) {
		const items = await createTupleOfItemsFromBank(client, itemBank);
		return items
			.map(
				([name, qty]) =>
					`${qty.toLocaleString()}x ${getOSItem(name).wiki_name ??
						getOSItem(name).name ??
						`__${name}__`}`
			)
			.join(', ');
	}

	async run(
		msg: KlasaMessage,
		[option = 'create', quantity = 1, itemName]: [string, number, string]
	) {
		const ornamentItem = Ornaments.find(i => {
			if (
				i.ornatedItemAliases &&
				i.ornatedItemAliases.some(a => stringMatches(a, cleanString(itemName)))
			) {
				return i;
			}
		});
		if (!ornamentItem) {
			return msg.send(`${itemName} is not a valid item to ornate.`);
		}
		await msg.author.settings.sync(true);
		const userBank = msg.author.settings.get(UserSettings.Bank);
		let itemsToRemove = {};
		let itemsToAdd = {};
		if (option === 'create' && !msg.flagArgs.remove) {
			itemsToRemove = addBanks([
				{ [ornamentItem.baseItem]: quantity },
				{ [ornamentItem.ornamentName]: quantity }
			]);
			if (!bankHasAllItemsFromBank(userBank, itemsToRemove)) {
				throw `You don't have the required items to create this item. You need: ${await this.createReadableItems(
					this.client,
					itemsToRemove
				)}.`;
			} else {
				itemsToAdd = { [ornamentItem.ornatedItem]: quantity };
			}
		} else if (option === 'remove' || msg.flagArgs.remove) {
			itemsToRemove = { [ornamentItem.ornatedItem]: quantity };
			if (!bankHasAllItemsFromBank(userBank, itemsToRemove)) {
				throw `You don't have the required items to create this item. You need: ${await this.createReadableItems(
					this.client,
					itemsToRemove
				)}.`;
			} else if (ornamentItem.returnOrnament) {
				itemsToAdd = addBanks([
					{ [ornamentItem.baseItem]: quantity },
					{ [ornamentItem.ornamentName]: quantity }
				]);
			} else {
				itemsToAdd = { [ornamentItem.baseItem]: quantity };
			}
		}
		const itemsToAddString = await this.createReadableItems(this.client, itemsToAdd);
		const itemsToRemoveString = await this.createReadableItems(this.client, itemsToRemove);

		if (!msg.flagArgs.cf && !msg.flagArgs.confirm) {
			const ornateMsg = await msg.channel.send(
				`${msg.author}, say \`confirm\` to confirm that you want to create **${itemsToAddString}** using ${itemsToRemoveString}.`
			);
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
				return ornateMsg.edit(`Cancelling item creation.`);
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
