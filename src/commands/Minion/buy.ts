import { MessageAttachment } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';
import { toKMB } from 'oldschooljs/dist/util/util';
import { table } from 'table';

import { Minigames } from '../../extendables/User/Minigame';
import Buyables from '../../lib/data/buyables/buyables';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import {
	bankHasAllItemsFromBank,
	formatSkillRequirements,
	multiplyBank,
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
			return msg.channel.send({
				content: 'Here is a table of all buyable items.',
				files: [new MessageAttachment(Buffer.from(normalTable), 'Buyables.txt')]
			});
		}

		if (buyable.customReq) {
			const [hasCustomReq, reason] = await buyable.customReq(msg.author);
			if (!hasCustomReq) {
				return msg.channel.send(reason!);
			}
		}

		if (buyable.qpRequired) {
			const QP = msg.author.settings.get(UserSettings.QP);
			if (QP < buyable.qpRequired) {
				return msg.channel.send(`You need ${buyable.qpRequired} QP to purchase this item.`);
			}
		}

		if (buyable.skillsNeeded && !skillsMeetRequirements(msg.author.rawSkills, buyable.skillsNeeded)) {
			return msg.channel.send(
				`You don't have the required stats to buy this item. You need ${formatSkillRequirements(
					buyable.skillsNeeded
				)}.`
			);
		}

		if (buyable.minigameScoreReq) {
			const [key, req] = buyable.minigameScoreReq;
			const kc = await msg.author.getMinigameScore(key);
			if (kc < req) {
				return msg.channel.send(
					`You need ${req} KC in ${
						Minigames.find(i => i.key === key)!.name
					} to buy this, you only have ${kc} KC.`
				);
			}
		}

		await msg.author.settings.sync(true);
		const userBank = msg.author.settings.get(UserSettings.Bank);

		if (buyable.itemCost && !bankHasAllItemsFromBank(userBank, multiplyBank(buyable.itemCost, quantity))) {
			return msg.channel.send(
				`You don't have the required items to purchase this. You need: ${new Bank(
					multiplyBank(buyable.itemCost, quantity)
				)}.`
			);
		}

		const GP = msg.author.settings.get(UserSettings.GP);
		const totalGPCost = (buyable.gpCost ?? 0) * quantity;

		if (buyable.gpCost && msg.author.settings.get(UserSettings.GP) < totalGPCost) {
			return msg.channel.send(`You need ${totalGPCost.toLocaleString()} GP to purchase this item.`);
		}

		let output =
			buyable.outputItems === undefined
				? new Bank().add(buyable.name).bank
				: buyable.outputItems instanceof Bank
				? buyable.outputItems.bank
				: buyable.outputItems;
		const outItems = multiplyBank(output, quantity);
		const itemString = new Bank(outItems).toString();

		// Start building a string to show to the user.
		let str = `${msg.author}, please confirm that you want to buy **${itemString}** for: `;

		// If theres an item cost or GP cost, add it to the string to show users the cost.
		if (buyable.itemCost) {
			str += new Bank(multiplyBank(buyable.itemCost, quantity)).toString();
			if (buyable.gpCost) {
				str += `, ${totalGPCost.toLocaleString()} GP.`;
			}
		} else if (buyable.gpCost) {
			str += `${totalGPCost.toLocaleString()} GP.`;
		}

		await msg.confirm(str);

		const costBank = new Bank();

		await msg.author.settings.sync(true);
		if (buyable.itemCost) {
			costBank.add(multiplyBank(buyable.itemCost, quantity));
		}

		if (buyable.gpCost) {
			if (GP < totalGPCost) {
				return msg.channel.send(`You need ${toKMB(totalGPCost)} GP to purchase this item.`);
			}
			costBank.add('Coins', totalGPCost);
		}

		await msg.author.exchangeItemsFromBank({ costBank, lootBank: outItems, collectionLog: true });
		await this.client.settings.update(
			ClientSettings.EconomyStats.BuyCostBank,
			new Bank(this.client.settings.get(ClientSettings.EconomyStats.BuyCostBank)).add(costBank).bank
		);

		return msg.channel.send(`You purchased ${quantity > 1 ? `${quantity}x` : '1x'} ${buyable.name}.`);
	}
}
