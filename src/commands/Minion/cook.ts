import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, Events, Tasks, Time } from '../../lib/constants';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Cooking from '../../lib/skilling/skills/cooking';
import { SkillsEnum } from '../../lib/skilling/types';
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
			usageDelim: ' '
		});
	}

	async run(msg: KlasaMessage, [quantity, cookableName = '']: [null | number | string, string]) {
		if (!msg.author.hasMinion) {
			throw `You dont have a minion`;
		}

		if (msg.author.minionIsBusy) {
			return msg.send(msg.author.minionStatus);
		}

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
			throw `Thats not a valid item to cook. Valid cookables are ${Cooking.Cookables.map(
				cookable => cookable.name
			).join(', ')}.`;
		}

		if (msg.author.skillLevel(SkillsEnum.Cooking) < cookable.level) {
			throw `${msg.author.minionName} needs ${cookable.level} Cooking to cook ${cookable.name}s.`;
		}

		const hasRemy = msg.author.equippedPet() === itemID('Remy');

		// Based off catherby fish/hr rates
		let timeToCookSingleCookable = Time.Second * 2.88;
		if (cookable.id === itemID('Jug of wine')) {
			timeToCookSingleCookable /= 1.6;
		} else if (hasRemy) {
			timeToCookSingleCookable /= 2;
		}

		const requiredCookables: [string, number][] = Object.entries(cookable.inputCookables);

		// // If no quantity provided, set it to the max the player can make by either the items in bank or time.
		if (quantity === null) {
			quantity = Math.floor(msg.author.maxTripLength / timeToCookSingleCookable);
			for (const [cookableID, qty] of requiredCookables) {
				const itemsOwned = msg.author.numItemsInBankSync(parseInt(cookableID));
				if (itemsOwned === 0) {
					throw `You have no ${itemNameFromID(parseInt(cookableID))}.`;
				}
				quantity = Math.min(quantity, Math.floor(itemsOwned / qty));
			}
		}

		const userBank = msg.author.settings.get(UserSettings.Bank);

		// Check the user has the required cookables
		// Multiplying the cookable required by the quantity
		for (const [cookableID, qty] of requiredCookables) {
			if (!bankHasItem(userBank, parseInt(cookableID), qty * quantity)) {
				throw `You don't have enough ${itemNameFromID(parseInt(cookableID))}.`;
			}
		}

		const duration = quantity * timeToCookSingleCookable;

		if (duration > msg.author.maxTripLength) {
			throw `${msg.author.minionName} can't go on trips longer than ${
				msg.author.maxTripLength
			} minutes, try a lower quantity. The highest amount of ${
				cookable.name
			}s you can cook is ${Math.floor(msg.author.maxTripLength / timeToCookSingleCookable)}.`;
		}

		// Remove the cookables from their bank.
		let newBank = { ...userBank };
		for (const [cookableID, qty] of requiredCookables) {
			if (newBank[parseInt(cookableID)] < qty) {
				this.client.emit(
					Events.Wtf,
					`${msg.author.sanitizedName} had insufficient cookables to be removed.`
				);
				throw `What a terrible failure :(`;
			}
			newBank = removeItemFromBank(newBank, parseInt(cookableID), qty * quantity);
		}

		await addSubTaskToActivityTask<CookingActivityTaskOptions>(
			this.client,
			Tasks.SkillingTicker,
			{
				cookableID: cookable.id,
				userID: msg.author.id,
				channelID: msg.channel.id,
				quantity,
				duration,
				type: Activity.Cooking
			}
		);
		await msg.author.settings.update(UserSettings.Bank, newBank);

		return msg.send(
			`${msg.author.minionName} is now cooking ${quantity}x ${
				cookable.name
			}, it'll take around ${formatDuration(duration)} to finish. ${
				hasRemy
					? `\n<:remy:748491189925183638> Remy jumps on your minions' head to help them with their cooking!`
					: ''
			}`
		);
	}
}
