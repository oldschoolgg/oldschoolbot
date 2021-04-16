import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';
import { toKMB } from 'oldschooljs/dist/util/util';
import { table } from 'table';

import { Time } from '../../lib/constants';
import Buyables from '../../lib/data/buyables/buyables';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import {
	bankHasAllItemsFromBank,
	multiplyBank,
	removeBankFromBank,
	skillsMeetRequirements,
	stringMatches
} from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[quantity:int{1,250000}] <name:...string>',
			usageDelim: ' ',
			oneAtTime: true,
			cooldown: 5,
			altProtection: true,
			categoryFlags: ['minion'],
			description: 'Allows you to purchase certain store/quest items from the bot.',
			examples: ['+buy barrows gloves', '+buy 1000 jug of water']
		});
	}

	async run(msg: KlasaMessage, [quantity = 1, buyableName]: [number, string]) {
		const buyable = Buyables.find(
			item =>
				stringMatches(buyableName, item.name) ||
				(item.aliases && item.aliases.some(alias => stringMatches(alias, buyableName)))
		);

		if (!buyable) {
			const normalTable = table([
				['Name', 'GP Cost', 'Item Cost'],
				...Buyables.map(i => [i.name, i.gpCost || 0, new Bank(i.itemCost).toString()])
			]);
			return msg.channel.sendFile(
				Buffer.from(normalTable),
				`Buyables.txt`,
				`Here is a table of all buyable items.`
			);
		}

		if (buyable.name === 'Bank lottery ticket' && msg.author.isIronman) {
			return msg.send(`Ironmen cant buy this.`);
		}

		if (buyable.qpRequired) {
			const QP = msg.author.settings.get(UserSettings.QP);
			if (QP < buyable.qpRequired) {
				return msg.send(`You need ${buyable.qpRequired} QP to purchase this item.`);
			}
		}

		if (
			buyable.skillsNeeded &&
			!skillsMeetRequirements(msg.author.rawSkills, buyable.skillsNeeded)
		) {
			return msg.send(`You don't have the required stats to buy this item.`);
		}

		await msg.author.settings.sync(true);
		const userBank = msg.author.settings.get(UserSettings.Bank);

		if (
			buyable.itemCost &&
			!bankHasAllItemsFromBank(userBank, multiplyBank(buyable.itemCost, quantity))
		) {
			return msg.send(
				`You don't have the required items to purchase this. You need: ${new Bank(
					multiplyBank(buyable.itemCost, quantity)
				)}.`
			);
		}

		const GP = msg.author.settings.get(UserSettings.GP);
		const totalGPCost = (buyable.gpCost ?? 0) * quantity;

		if (buyable.gpCost && msg.author.settings.get(UserSettings.GP) < totalGPCost) {
			return msg.send(`You need ${totalGPCost.toLocaleString()} GP to purchase this item.`);
		}

		const outItems = multiplyBank(buyable.outputItems, quantity);
		const itemString = new Bank(outItems).toString();

		// Start building a string to show to the user.
		let str = `${msg.author}, say \`confirm\` to confirm that you want to buy **${itemString}** for: `;

		// If theres an item cost or GP cost, add it to the string to show users the cost.
		if (buyable.itemCost) {
			str += new Bank(multiplyBank(buyable.itemCost, quantity)).toString();
			if (buyable.gpCost) {
				str += `, ${totalGPCost.toLocaleString()} GP.`;
			}
		} else if (buyable.gpCost) {
			str += `${totalGPCost.toLocaleString()} GP.`;
		}

		if (!msg.flagArgs.cf && !msg.flagArgs.confirm) {
			const sellMsg = await msg.channel.send(str);

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
				return sellMsg.edit(`Cancelling purchase.`);
			}
		}

		const econBankChanges = new Bank();

		await msg.author.settings.sync(true);
		if (buyable.itemCost) {
			econBankChanges.add(multiplyBank(buyable.itemCost, quantity));
			await msg.author.settings.update(
				UserSettings.Bank,
				removeBankFromBank(
					msg.author.settings.get(UserSettings.Bank),
					multiplyBank(buyable.itemCost, quantity)
				)
			);
		}

		if (buyable.gpCost) {
			if (GP < totalGPCost) {
				return msg.send(`You need ${toKMB(totalGPCost)} GP to purchase this item.`);
			}
			econBankChanges.add('Coins', totalGPCost);
			await msg.author.removeGP(totalGPCost);
		}

		await this.client.settings.update(
			ClientSettings.EconomyStats.BuyCostBank,
			new Bank(this.client.settings.get(ClientSettings.EconomyStats.BuyCostBank)).add(
				econBankChanges
			).bank
		);

		if (buyable.name === 'Bank lottery ticket') {
			await this.client.settings.update(
				ClientSettings.BankLottery,
				new Bank(this.client.settings.get(ClientSettings.BankLottery)).add(
					995,
					buyable.gpCost! * quantity
				).bank
			);
		}

		await msg.author.addItemsToBank(outItems, true);

		return msg.send(`You purchased ${quantity > 1 ? `${quantity}x` : '1x'} ${buyable.name}.`);
	}
}
