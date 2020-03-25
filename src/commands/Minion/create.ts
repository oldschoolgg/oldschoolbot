import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Time } from '../../lib/constants';
import { UserSettings } from '../../lib/UserSettings';
import { stringMatches, addBankToBank, removeBankFromBank } from '../../lib/util';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
import Craftables from '../../lib/craftables';
import { SkillsEnum } from '../../lib/types';
import { bankHasAllItemsFromBank } from '../../lib/util/bankHasAllItemsFromBank';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<itemName:string>',
			oneAtTime: true,
			cooldown: 5,
			altProtection: true
		});
	}

	async run(msg: KlasaMessage, [itemName]: [string]) {
		itemName = itemName.toLowerCase();

		const craftableItem = Craftables.find(item => stringMatches(item.name, itemName));
		if (!craftableItem) throw `That's not a valid item you can create.`;

		// Ensure they have the required skills to create the item.
		if (
			craftableItem.smithingLevel &&
			msg.author.skillLevel(SkillsEnum.Smithing) < craftableItem.smithingLevel
		) {
			throw `Your smithing level isn't high enough to craft this item. You need ${craftableItem.smithingLevel} Smithing.`;
		}

		const outputItemsString = await createReadableItemListFromBank(
			this.client,
			craftableItem.outputItems
		);

		const inputItemsString = await createReadableItemListFromBank(
			this.client,
			craftableItem.inputItems
		);

		await msg.author.settings.sync(true);
		const userBank = msg.author.settings.get(UserSettings.Bank);

		// Ensure they have the required items to create the item.
		if (!bankHasAllItemsFromBank(userBank, craftableItem.inputItems)) {
			throw `You don't have the required items to create this item. You need: ${inputItemsString}.`;
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
			addBankToBank(
				craftableItem.outputItems,
				removeBankFromBank(userBank, craftableItem.inputItems)
			)
		);

		if (craftableItem.addOutputToCollectionLog) {
			msg.author.addItemsToCollectionLog(craftableItem.outputItems);
		}

		return msg.send(`You created ${outputItemsString}.`);
	}
}
