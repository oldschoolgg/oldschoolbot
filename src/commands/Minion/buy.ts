import { CommandStore, KlasaMessage } from 'klasa';
import { toKMB } from 'oldschooljs/dist/util/util';

import { BotCommand } from '../../lib/BotCommand';
import { Time } from '../../lib/constants';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { stringMatches, toTitleCase, multiplyBank } from '../../lib/util';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
import Buyables from '../../lib/buyables';
import { bankHasAllItemsFromBank, removeBankFromBank } from 'oldschooljs/dist/util';
import { Bank } from '../../lib/types';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[quantity:int{1,250000}] <name:...string>',
			usageDelim: ' ',
			oneAtTime: true,
			cooldown: 5,
			altProtection: true
		});
	}

	async run(msg: KlasaMessage, [quantity = 1, buyableName]: [number, string]) {
		const buyable = Buyables.find(
			item =>
				stringMatches(buyableName, item.name) ||
				(item.aliases && item.aliases.some(alias => stringMatches(alias, buyableName)))
		);

		if (!buyable) {
			throw `I don't recognize that item, the items you can buy are: ${Buyables.map(
				item => item.name
			).join(', ')}.`;
		}

		await msg.author.settings.sync(true);
		const GP = msg.author.settings.get(UserSettings.GP);
		const GPCost = buyable.gpCost * quantity;
		const commendationPoints = await msg.author.settings.get(UserSettings.CommendationPoints);
		const commendationCost = buyable.commendationPoints
			? buyable.commendationPoints * quantity
			: 0;
		const userBank = msg.author.settings.get(UserSettings.Bank);
		const requiredItems = multiplyBank(buyable.requiredItems ?? ({} as Bank), quantity);
		if (GP < GPCost) {
			throw `You need ${toKMB(GPCost)} GP to purchase this item.`;
		}
		const QP = msg.author.settings.get(UserSettings.QP);
		if (QP < buyable.qpRequired) {
			throw `You need ${buyable.qpRequired} QP to purchase this item.`;
		}

		if (buyable.commendationPoints && commendationPoints < commendationCost) {
			throw `You need ${commendationCost} commendation points to purchase this item`;
		}

		if (buyable.requiredItems) {
			const requiredItemsStr = await createReadableItemListFromBank(
				this.client,
				requiredItems
			);

			if (!bankHasAllItemsFromBank(userBank, requiredItems)) {
				throw `You don't have the required items, you need ${requiredItemsStr}`;
			}
		}

		const outItems = multiplyBank(buyable.outputItems, quantity);
		const itemString = await createReadableItemListFromBank(this.client, outItems);

		if (!msg.flagArgs.cf && !msg.flagArgs.confirm) {
			const priceString = buyable.commendationPoints
				? `${commendationCost} commendation points`
				: `${toKMB(GPCost)}`;
			const sellMsg = await msg.channel.send(
				`${msg.author}, say \`confirm\` to confirm that you want to purchase ${itemString} for ${priceString}.`
			);

			// Confirm the user wants to buy
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
				return sellMsg.edit(
					`Cancelling purchase of ${quantity} ${toTitleCase(buyable.name)}.`
				);
			}
		}

		let purchaseString = `You purchased ${itemString} for ${toKMB(GPCost)}.`;

		if (buyable.commendationPoints) {
			await msg.author.removeCommendationPoints(commendationCost);
			purchaseString = `You purchased ${itemString} for ${commendationCost} commendation points`;
		}
		if (buyable.requiredItems) {
			await msg.author.settings.update(
				UserSettings.Bank,
				removeBankFromBank(userBank, requiredItems)
			);
		}
		await msg.author.removeGP(GPCost);
		await msg.author.addItemsToBank(outItems, true);

		return msg.send(purchaseString);
	}
}
