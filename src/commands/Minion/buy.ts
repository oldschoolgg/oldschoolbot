import { CommandStore, KlasaMessage } from 'klasa';
import { toKMB } from 'oldschooljs/dist/util/util';

import { BotCommand } from '../../lib/BotCommand';
import { Time } from '../../lib/constants';
import { UserSettings } from '../../lib/UserSettings';
import { stringMatches, toTitleCase } from '../../lib/util';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
import Buyables from '../../lib/buyables';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[name:string]',
			oneAtTime: true,
			cooldown: 5,
			altProtection: true
		});
	}

	async run(msg: KlasaMessage, [buyableName = '']: [string]) {
		const buyable = Buyables.find(item => stringMatches(buyableName, item.name));
		if (!buyable) {
			throw `I don't recognize that item, the items you can buy are: ${Buyables.map(
				item => item.name
			).join(', ').}`;
		}

		await msg.author.settings.sync(true);
		const GP = msg.author.settings.get(UserSettings.GP);
		if (GP < buyable.gpCost) throw `You don't have enough GP to buy this item.`;

		const QP = msg.author.settings.get(UserSettings.QP);
		if (QP < buyable.qpRequired) {
			throw `You need ${buyable.qpRequired} QP to purchase this item.`;
		}

		const itemString = await createReadableItemListFromBank(this.client, buyable.outputItems);

		const sellMsg = await msg.channel.send(
			`${
				msg.author
			}, say \`confirm\` to confirm that you want to purchase ${itemString} for ${toKMB(
				buyable.gpCost
			)}.`
		);

		// Confirm the user wants to buy
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
			return sellMsg.edit(`Cancelling purchase of ${toTitleCase(buyable.name)}.`);
		}

		await msg.author.removeGP(buyable.gpCost);
		await msg.author.addItemsToBank(buyable.outputItems, true);

		return msg.send(`You purchased ${itemString} for ${toKMB(buyable.gpCost)}.`);
	}
}
