import { MessageAttachment } from 'discord.js';
import { randArrItem } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';
import { toKMB } from 'oldschooljs/dist/util/util';
import { table } from 'table';

import Buyables from '../../lib/data/buyables/buyables';
import { kittens } from '../../lib/growablePets';
import { Minigames } from '../../lib/settings/settings';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import {
	bankHasAllItemsFromBank,
	formatSkillRequirements,
	multiplyBank,
	skillsMeetRequirements,
	stringMatches,
	updateBankSetting
} from '../../lib/util';
import getOSItem from '../../lib/util/getOSItem';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[quantity:int{1,250000}] <name:...string>',
			usageDelim: ' ',
			cooldown: 5,
			altProtection: true,
			categoryFlags: ['minion'],
			description: 'Allows you to purchase certain store/quest items from the bot.',
			examples: ['+buy barrows gloves', '+buy 1000 jug of water']
		});
	}

	async run(msg: KlasaMessage, [quantity = 1, buyableName]: [number, string]) {
		if (buyableName === 'kitten') {
			const cost = new Bank().add('Coins', 1000);
			if (!msg.author.owns(cost)) {
				return msg.chatHeadImage('gertrude', "You don't have enough GP to buy a kitten! They cost 1000 coins.");
			}
			if (msg.author.settings.get(UserSettings.QP) < 10) {
				return msg.chatHeadImage('gertrude', "You haven't done enough quests to raise a kitten yet!");
			}

			const allItemsOwned = msg.author.allItemsOwned();
			if (kittens.some(kitten => allItemsOwned.has(kitten))) {
				return msg.chatHeadImage('gertrude', "You are already raising a kitten! You can't handle a second.");
			}

			const kitten = getOSItem(randArrItem(kittens));

			const loot = new Bank().add(kitten.id);

			await msg.author.removeItemsFromBank(cost);
			await msg.author.addItemsToBank({ items: loot, collectionLog: true });
			return msg.chatHeadImage(
				'gertrude',
				`Here's a ${kitten.name}, raise it well and take care of it, please!`,
				`Removed ${cost} from your bank.`
			);
		}

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
			let kc = await msg.author.getMinigameScore(key);
			if (key === 'tob') {
				kc += await msg.author.getMinigameScore('tob_hard');
			}
			if (kc < req) {
				return msg.channel.send(
					`You need ${req} KC in ${
						Minigames.find(i => i.column === key)!.name
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
		const gpCost =
			msg.author.isIronman && buyable.ironmanPrice !== undefined ? buyable.ironmanPrice : buyable.gpCost;

		const totalGPCost = (gpCost ?? 0) * quantity;

		if (gpCost && msg.author.settings.get(UserSettings.GP) < totalGPCost) {
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
			if (gpCost) {
				str += `, ${totalGPCost.toLocaleString()} GP.`;
			}
		} else if (gpCost) {
			str += `${totalGPCost.toLocaleString()} GP.`;
		}

		await msg.confirm(str);

		const econBankChanges = new Bank();

		await msg.author.settings.sync(true);
		if (buyable.itemCost) {
			const cost = new Bank(buyable.itemCost).multiply(quantity);

			econBankChanges.add(cost);
			await msg.author.removeItemsFromBank(cost);
		}

		if (gpCost) {
			if (GP < totalGPCost) {
				return msg.channel.send(`You need ${toKMB(totalGPCost)} GP to purchase this item.`);
			}
			econBankChanges.add('Coins', totalGPCost);
			await msg.author.removeGP(totalGPCost);
		}

		updateBankSetting(this.client, ClientSettings.EconomyStats.BuyCostBank, econBankChanges);
		updateBankSetting(this.client, ClientSettings.EconomyStats.BuyLootBank, outItems);

		await msg.author.addItemsToBank({ items: outItems, collectionLog: true });

		return msg.channel.send(`You purchased ${quantity > 1 ? `${quantity}x` : '1x'} ${buyable.name}.`);
	}
}
