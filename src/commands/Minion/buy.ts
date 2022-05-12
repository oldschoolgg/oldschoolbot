import { MessageAttachment } from 'discord.js';
import { randArrItem } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';
import { table } from 'table';

import Buyables from '../../lib/data/buyables/buyables';
import { kittens } from '../../lib/growablePets';
import { Minigames } from '../../lib/settings/settings';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import {
	formatSkillRequirements,
	itemNameFromID,
	skillsMeetRequirements,
	stringMatches,
	updateBankSetting
} from '../../lib/util';
import getOSItem from '../../lib/util/getOSItem';
import { mahojiUsersSettingsFetch } from '../../mahoji/mahojiSettings';

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

		if (buyable.collectionLogReqs) {
			const cl = new Bank(msg.author.settings.get(UserSettings.CollectionLogBank));
			const unownedItems = buyable.collectionLogReqs.filter(i => !cl.has(i));
			if (unownedItems.length > 0) {
				return msg.channel.send(
					`You don't have **${unownedItems.map(itemNameFromID).join(', ')}** in your collection log`
				);
			}
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

		const gpCost =
			msg.author.isIronman && buyable.ironmanPrice !== undefined ? buyable.ironmanPrice : buyable.gpCost;

		const singleCost: Bank = buyable.itemCost ?? new Bank();
		if (gpCost) singleCost.add('Coins', gpCost);

		const totalCost = singleCost.clone().multiply(quantity);
		if (!msg.author.owns(totalCost)) {
			return msg.channel.send(`You don't have the required items to purchase this. You need: ${totalCost}.`);
		}

		let singleOutput: Bank =
			buyable.outputItems === undefined
				? new Bank().add(buyable.name)
				: buyable.outputItems instanceof Bank
				? buyable.outputItems
				: buyable.outputItems(await mahojiUsersSettingsFetch(msg.author.id));

		const outItems = singleOutput.clone().multiply(quantity);
		const itemString = new Bank(outItems).toString();

		// This will show both coins and item costs, and both can be used together, seamlessly.
		const str = `${
			msg.author
		}, please confirm that you want to buy **${itemString}** for: ${totalCost.toString()}. `;

		await msg.confirm(str);

		const econBankChanges = new Bank();

		await msg.author.settings.sync(true);

		await msg.author.removeItemsFromBank(totalCost);
		econBankChanges.add(totalCost);

		updateBankSetting(this.client, ClientSettings.EconomyStats.BuyCostBank, econBankChanges);
		updateBankSetting(this.client, ClientSettings.EconomyStats.BuyLootBank, outItems);

		await msg.author.addItemsToBank({ items: outItems, collectionLog: true });

		return msg.channel.send(`You purchased ${outItems.toString()}.`);
	}
}
