import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Time } from '../../lib/constants';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import {
	stringMatches,
	addBankToBank,
	removeBankFromBank,
	multiplyBankQuantity
} from '../../lib/util';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
import Createables from '../../lib/createables';
import { bankHasAllItemsFromBank } from '../../lib/util/bankHasAllItemsFromBank';
import { SkillsEnum } from '../../lib/skilling/types';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[quantity:int{1}] <itemName:...string>',
			usageDelim: ' ',
			oneAtTime: true,
			cooldown: 5,
			altProtection: true
		});
	}

	async run(msg: KlasaMessage, [quantity, itemName]: [number, string]) {
		itemName = itemName.toLowerCase();

		const createableItem = Createables.find(item => stringMatches(item.name, itemName));
		if (!createableItem) throw `That's not a valid item you can create.`;

		if (typeof quantity !== 'number' || createableItem.cantHaveItems) {
			quantity = 1;
		}

		// Ensure they have the required skills to create the item.
		if (
			createableItem.smithingLevel &&
			msg.author.skillLevel(SkillsEnum.Smithing) < createableItem.smithingLevel
		) {
			throw `You need ${createableItem.smithingLevel} smithing to create this item.`;
		}

		if (
			createableItem.firemakingLevel &&
			msg.author.skillLevel(SkillsEnum.Firemaking) < createableItem.firemakingLevel
		) {
			throw `You need ${createableItem.firemakingLevel} firemaking to create this item.`;
		}

		if (
			createableItem.craftingLevel &&
			msg.author.skillLevel(SkillsEnum.Crafting) < createableItem.craftingLevel
		) {
			throw `You need ${createableItem.craftingLevel} crafting to create this item.`;
		}

		const outItems = multiplyBankQuantity(createableItem.outputItems, quantity);
		const inItems = multiplyBankQuantity(createableItem.inputItems, quantity);

		const outputItemsString = await createReadableItemListFromBank(this.client, outItems);

		const inputItemsString = await createReadableItemListFromBank(this.client, inItems);

		const cantHaveItemsString = await createReadableItemListFromBank(
			this.client,
			createableItem.cantHaveItems
		);

		await msg.author.settings.sync(true);
		const userBank = msg.author.settings.get(UserSettings.Bank);

		// Ensure they have the required items to create the item.
		if (!bankHasAllItemsFromBank(userBank, inItems)) {
			throw `You don't have the required items to create this item. You need: ${inputItemsString}.`;
		}

		// Check for any items they cant have 2 of.
		for (const [itemID, qty] of Object.entries(createableItem.cantHaveItems)) {
			const numOwned = msg.author.numOfItemsOwned(parseInt(itemID));
			if (numOwned >= qty) {
				throw `You can't create this item, because you have ${cantHaveItemsString} in your bank.`;
			}
		}

		const sellMsg = await msg.channel.send(
			`${msg.author}, say \`confirm\` to confirm that you want to create **${outputItemsString}** using ${inputItemsString}.`
		);

		// Confirm the user wants to create the item(s)
		try {
			await msg.channel.awaitMessages(
				_msg =>
					_msg.author.id === msg.author.id && _msg.content.toLowerCase() === 'confirm',
				{
					max: 1,
					time: Time.Second * 15,
					errors: ['time']
				}
			);
		} catch (err) {
			return sellMsg.edit(`Cancelling item creation.`);
		}

		await msg.author.settings.update(
			UserSettings.Bank,
			addBankToBank(outItems, removeBankFromBank(userBank, inItems))
		);

		if (createableItem.addOutputToCollectionLog) {
			msg.author.addItemsToCollectionLog(outItems);
		}

		return msg.send(`You created ${outputItemsString}.`);
	}
}
