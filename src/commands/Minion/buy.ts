import { CommandStore, KlasaMessage } from 'klasa';
import { toKMB } from 'oldschooljs/dist/util/util';

import { BotCommand } from '../../lib/BotCommand';
import Buyables from '../../lib/buyables/buyables';
import { Time } from '../../lib/constants';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { multiplyBank, stringMatches, toTitleCase } from '../../lib/util';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';

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
		if (GP < GPCost) {
			throw `You need ${toKMB(GPCost)} GP to purchase this item.`;
		}
		const QP = msg.author.settings.get(UserSettings.QP);
		if (QP < buyable.qpRequired) {
			throw `You need ${buyable.qpRequired} QP to purchase this item.`;
		}

		const outItems = multiplyBank(buyable.outputItems, quantity);
		const itemString = await createReadableItemListFromBank(this.client, outItems);

		if (!msg.flagArgs.cf && !msg.flagArgs.confirm) {
			const sellMsg = await msg.channel.send(
				`${
					msg.author
				}, say \`confirm\` to confirm that you want to purchase ${itemString} for ${toKMB(
					GPCost
				)}.`
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

		await msg.author.removeGP(GPCost);
		await msg.author.addItemsToBank(outItems, true);

		return msg.send(`You purchased ${itemString} for ${toKMB(GPCost)}.`);
	}
}
