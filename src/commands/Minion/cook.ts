import { CommandStore, KlasaMessage } from 'klasa';

import { Activity, Time } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Cooking from '../../lib/skilling/skills/cooking';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { CookingActivityTaskOptions } from '../../lib/types/minions';
import {
	bankHasItem,
	formatDuration,
	itemNameFromID,
	removeItemFromBank,
	stringMatches
} from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import itemID from '../../lib/util/itemID';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '<quantity:int{1}|name:...string> [name:...string]',
			usageDelim: ' ',
			description: 'Sends your minion to cook food.',
			categoryFlags: ['minion', 'skilling'],
			examples: ['+cook manta ray', '+cook 50 shrimps']
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage, [quantity, cookableName = '']: [null | number | string, string]) {
		if (typeof quantity === 'string') {
			cookableName = quantity;
			quantity = null;
		}

		await msg.author.settings.sync(true);
		const cookable = Cooking.Cookables.find(
			cookable =>
				stringMatches(cookable.name, cookableName) ||
				stringMatches(cookable.name.split(' ')[0], cookableName)
		);

		if (!cookable) {
			return msg.send(
				`Thats not a valid item to cook. Valid cookables are ${Cooking.Cookables.map(
					cookable => cookable.name
				).join(', ')}.`
			);
		}

		if (msg.author.skillLevel(SkillsEnum.Cooking) < cookable.level) {
			return msg.send(
				`${msg.author.minionName} needs ${cookable.level} Cooking to cook ${cookable.name}s.`
			);
		}

		// Based off catherby fish/hr rates
		let timeToCookSingleCookable = Time.Second * 2.88;
		if (cookable.id === itemID('Jug of wine') || cookable.id === itemID('Wine of zamorak')) {
			timeToCookSingleCookable /= 1.6;
		}

		const requiredCookables: [string, number][] = Object.entries(cookable.inputCookables);

		// // If no quantity provided, set it to the max the player can make by either the items in bank or time.
		if (quantity === null) {
			quantity = Math.floor(msg.author.maxTripLength / timeToCookSingleCookable);
			for (const [cookableID, qty] of requiredCookables) {
				const itemsOwned = msg.author.numItemsInBankSync(parseInt(cookableID));
				if (itemsOwned === 0) {
					return msg.send(`You have no ${itemNameFromID(parseInt(cookableID))}.`);
				}
				quantity = Math.min(quantity, Math.floor(itemsOwned / qty));
			}
		}

		const userBank = msg.author.settings.get(UserSettings.Bank);

		// Check the user has the required cookables
		// Multiplying the cookable required by the quantity
		for (const [cookableID, qty] of requiredCookables) {
			if (!bankHasItem(userBank, parseInt(cookableID), qty * quantity)) {
				return msg.send(`You don't have enough ${itemNameFromID(parseInt(cookableID))}.`);
			}
		}

		const duration = quantity * timeToCookSingleCookable;

		if (duration > msg.author.maxTripLength) {
			return msg.send(
				`${msg.author.minionName} can't go on trips longer than ${formatDuration(
					msg.author.maxTripLength
				)} minutes, try a lower quantity. The highest amount of ${
					cookable.name
				}s you can cook is ${Math.floor(
					msg.author.maxTripLength / timeToCookSingleCookable
				)}.`
			);
		}

		// Remove the cookables from their bank.
		let newBank = { ...userBank };
		for (const [cookableID, qty] of requiredCookables) {
			if (newBank[parseInt(cookableID)] < qty) {
				this.client.wtf(
					new Error(
						`${msg.author.sanitizedName} had insufficient cookables to be removed.`
					)
				);
				return;
			}
			newBank = removeItemFromBank(newBank, parseInt(cookableID), qty * quantity);
		}

		await addSubTaskToActivityTask<CookingActivityTaskOptions>(this.client, {
			cookableID: cookable.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.Cooking
		});
		await msg.author.settings.update(UserSettings.Bank, newBank);

		return msg.send(
			`${msg.author.minionName} is now cooking ${quantity}x ${
				cookable.name
			}, it'll take around ${formatDuration(duration)} to finish.`
		);
	}
}
