import { CommandStore, KlasaMessage } from 'klasa';

import { Activity, Time, xpBoost } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Herblore from '../../lib/skilling/skills/herblore/herblore';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { HerbloreActivityTaskOptions } from '../../lib/types/minions';
import {
	addBanks,
	bankHasItem,
	formatDuration,
	itemNameFromID,
	multiplyBank,
	removeItemFromBank,
	stringMatches
} from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['crush', 'clean'],
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '[quantity:int{1}|name:...string] [name:...string]',
			usageDelim: ' '
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage, [quantity, mixName = '']: [null | number | string, string]) {
		if (msg.flagArgs.items) {
			return msg.channel.sendFile(
				Buffer.from(
					Herblore.Mixables.map(
						item =>
							`${item.name} - lvl ${item.level} : ${Object.entries(item.inputItems)
								.map(entry => `${entry[1]} ${itemNameFromID(parseInt(entry[0]))}`)
								.join(', ')}`
					).join('\n')
				),
				`Available Herblore potions and items.txt`
			);
		}

		if (typeof quantity === 'string') {
			mixName = quantity;
			quantity = null;
		}
		const mixableItem = Herblore.Mixables.find(item =>
			item.aliases.some(alias => stringMatches(alias, mixName))
		);

		if (!mixableItem) {
			return msg.send(
				`That is not a valid mixable item, to see the items available do \`${msg.cmdPrefix}mix --items\``
			);
		}

		if (msg.author.skillLevel(SkillsEnum.Herblore) < mixableItem.level) {
			return msg.send(
				`${msg.author.minionName} needs ${mixableItem.level} Herblore to make ${mixableItem.name}.`
			);
		}

		if (
			mixableItem.qpRequired &&
			msg.author.settings.get(UserSettings.QP) < mixableItem.qpRequired
		) {
			return msg.send(
				`You need atleast **${mixableItem.qpRequired}** QP to make ${mixableItem.name}.`
			);
		}

		let sets = 'x';
		let cost = 'is now';
		if (mixableItem.outputMultiple) {
			sets = 'batches of';
		}

		await msg.author.settings.sync(true);
		const userBank = msg.author.settings.get(UserSettings.Bank);
		let requiredItems: [string, number][] = Object.entries(mixableItem.inputItems);

		// Get the base time to mix the item then add on quarter of a second per item to account for banking/etc.
		let timeToMixSingleItem =
			mixableItem.tickRate * Time.Second * 0.6 + mixableItem.bankTimePerPotion * Time.Second;

		const zahur = Boolean(msg.flagArgs.zahur);
		if (zahur && mixableItem.zahur === true) {
			timeToMixSingleItem = 0.000001;
			requiredItems = requiredItems.concat([['995', 200]]);
			cost = "decided to pay Zahur 200 gp for each potion so they don't have to go";
		}
		if (msg.flagArgs.wesley && mixableItem.wesley === true) {
			timeToMixSingleItem = 0.000001;
			requiredItems = requiredItems.concat([['995', 50]]);
			cost = "decided to pay Wesley 50 gp for each item so they don't have to go";
		}

		const maxTripLength = 200984200 

		// If no quantity provided, set it to the max the player can make by either the items in bank or max time.
		if (quantity === null) {
			quantity = Math.floor(maxTripLength / timeToMixSingleItem);
			for (const [itemID, qty] of requiredItems) {
				const id = parseInt(itemID);
				if (id === 995) {
					const userGP = msg.author.settings.get(UserSettings.GP);
					if (userGP < qty) {
						return msg.send(`You do not have enough GP.`);
					}
					quantity = Math.min(quantity, Math.floor(userGP / qty));
					continue;
				}
				const itemsOwned = userBank[parseInt(itemID)];
				if (itemsOwned < qty) {
					return msg.send(`You dont have enough ${itemNameFromID(parseInt(itemID))}.`);
				}
				quantity = Math.min(quantity, Math.floor(itemsOwned / qty));
			}
		}

		const duration = quantity * timeToMixSingleItem * xpBoost;

		if (duration > maxTripLength) {
			return msg.send(
				`${msg.author.minionName} can't go on trips longer than ${formatDuration(
					maxTripLength
				)}, try a lower quantity. The highest amount of ${
					mixableItem.name
				}s you can make is ${Math.floor(maxTripLength / timeToMixSingleItem)}.`
			);
		}

		for (const [itemID, qty] of requiredItems) {
			const id = parseInt(itemID);
			if (id === 995) {
				const userGP = msg.author.settings.get(UserSettings.GP);
				if (userGP < qty * quantity) {
					return msg.send(`You don't have enough ${itemNameFromID(id)}.`);
				}
				continue;
			}
			if (!bankHasItem(userBank, id, qty * quantity)) {
				return msg.send(`You don't have enough ${itemNameFromID(id)}.`);
			}
		}
		// Remove the required items from their bank.
		let newBank = { ...userBank };
		for (const [itemID, qty] of requiredItems) {
			if (parseInt(itemID) === 995) {
				await msg.author.removeGP(qty * quantity);
				continue;
			}
			newBank = removeItemFromBank(newBank, parseInt(itemID), qty * quantity);
		}
		await msg.author.settings.update(UserSettings.Bank, newBank);

		await this.client.settings.update(
			ClientSettings.EconomyStats.HerbloreCostBank,
			addBanks([
				this.client.settings.get(ClientSettings.EconomyStats.HerbloreCostBank),
				multiplyBank(mixableItem.inputItems, quantity)
			])
		);

		await addSubTaskToActivityTask<HerbloreActivityTaskOptions>(this.client, {
			mixableID: mixableItem.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			zahur,
			quantity,
			duration,
			type: Activity.Herblore
		});

		return msg.send(
			`${msg.author.minionName} ${cost} Making ${quantity} ${sets} ${
				mixableItem.name
			}, it'll take around ${formatDuration(duration)} to finish.`
		);
	}
}
