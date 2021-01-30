import { CommandStore, KlasaMessage } from 'klasa';

import { Activity, Time } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Crafting from '../../lib/skilling/skills/crafting';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { CraftingActivityTaskOptions } from '../../lib/types/minions';
import {
	bankHasItem,
	formatDuration,
	itemID,
	itemNameFromID,
	removeItemFromBank,
	stringMatches
} from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['tan'],
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '[quantity:int{1}|name:...string] [name:...string]',
			usageDelim: ' ',
			categoryFlags: ['minion', 'skilling'],
			description: 'Sends your minion to craft items, or tan leather.',
			examples: ['+craft green dhide body', '+craft leather']
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage, [quantity, craftName = '']: [null | number | string, string]) {
		if (msg.flagArgs.items) {
			return msg.channel.sendFile(
				Buffer.from(
					Crafting.Craftables.map(
						item =>
							`${item.name} - lvl ${item.level} : ${Object.entries(item.inputItems)
								.map(entry => `${entry[1]} ${itemNameFromID(parseInt(entry[0]))}`)
								.join(', ')}`
					).join('\n')
				),
				`Available crafting items.txt`
			);
		}

		if (typeof quantity === 'string') {
			craftName = quantity;
			quantity = null;
		}

		const Craft = Crafting.Craftables.find(item => stringMatches(item.name, craftName));

		if (!Craft) {
			return msg.send(
				`That is not a valid craftable item, to see the items available do \`${msg.cmdPrefix}craft --items\``
			);
		}

		if (msg.author.skillLevel(SkillsEnum.Crafting) < Craft.level) {
			return msg.send(
				`${msg.author.minionName} needs ${Craft.level} Crafting to craft ${Craft.name}.`
			);
		}

		await msg.author.settings.sync(true);
		const userBank = msg.author.settings.get(UserSettings.Bank);
		const requiredItems: [string, number][] = Object.entries(Craft.inputItems);

		// Get the base time to craft the item then add on quarter of a second per item to account for banking/etc.
		let timeToCraftSingleItem = Craft.tickRate * Time.Second * 0.6 + Time.Second / 4;
		if (msg.author.hasItemEquippedAnywhere(itemID('Dwarven greathammer'))) {
			timeToCraftSingleItem /= 2;
		}
		// If no quantity provided, set it to the max the player can make by either the items in bank or max time.
		if (quantity === null) {
			quantity = Math.floor(msg.author.maxTripLength / timeToCraftSingleItem);
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

		const duration = quantity * timeToCraftSingleItem;

		if (duration > msg.author.maxTripLength) {
			return msg.send(
				`${msg.author.minionName} can't go on trips longer than ${formatDuration(
					msg.author.maxTripLength
				)}, try a lower quantity. The highest amount of ${
					Craft.name
				}s you can craft is ${Math.floor(
					msg.author.maxTripLength / timeToCraftSingleItem
				)}.`
			);
		}

		// Check the user has add the required items to craft.
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

		await addSubTaskToActivityTask<CraftingActivityTaskOptions>(this.client, {
			craftableID: Craft.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.Crafting
		});

		return msg.send(
			`${msg.author.minionName} is now crafting ${quantity}x ${
				Craft.name
			}, it'll take around ${formatDuration(duration)} to finish.`
		);
	}
}
