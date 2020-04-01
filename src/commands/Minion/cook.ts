import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import {
	stringMatches,
	formatDuration,
	rand,
	removeItemFromBank,
	itemNameFromID
} from '../../lib/util';
import { SkillsEnum } from '../../lib/types';
import { Time, Activity, Tasks, Events } from '../../lib/constants';
import { CookingActivityTaskOptions } from '../../lib/types/minions';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import Cooking from '../../lib/skills/cooking';
import { UserSettings } from '../../lib/UserSettings';
import itemID from '../../lib/util/itemID';
import bankHasItem from '../../lib/util/bankHasItem';

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

		// Based off catherby fish/hr rates
		let timeToCookSingleCookable = Time.Second * 2.88;
		if (cookable.id === itemID('Jug of wine')) {
			timeToCookSingleCookable /= 1.6;
		}

		// If no quantity provided, set it to the max.
		if (quantity === null) {
			quantity = Math.floor((Time.Minute * 30) / timeToCookSingleCookable);
		}

		await msg.author.settings.sync(true);
		const userBank = msg.author.settings.get(UserSettings.Bank);

		// Check the user has the required ores to smith these bars.
		// Multiplying the ore required by the quantity of bars.

		const requiredCookables: [string, number][] = Object.entries(cookable.inputCookables);
		for (const [cookableID, qty] of requiredCookables) {
			if (!bankHasItem(userBank, parseInt(cookableID), qty * quantity)) {
				throw `You don't have enough ${itemNameFromID(parseInt(cookableID))}.`;
			}
		}

		const duration = quantity * timeToCookSingleCookable;

		if (duration > Time.Minute * 30) {
			throw `${
				msg.author.minionName
			} can't go on trips longer than 30 minutes, try a lower quantity. The highest amount of ${
				cookable.name
			}s you can cook is ${Math.floor((Time.Minute * 30) / timeToCookSingleCookable)}.`;
		}

		const data: CookingActivityTaskOptions = {
			cookableID: cookable.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.Cooking,
			id: rand(1, 10_000_000),
			finishDate: Date.now() + duration
		};

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

		await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);
		await msg.author.settings.update(UserSettings.Bank, newBank);

		msg.author.incrementMinionDailyDuration(duration);
		return msg.send(
			`${msg.author.minionName} is now cooking ${quantity}x ${
				cookable.name
			}, it'll take around ${formatDuration(duration)} to finish.`
		);
	}
}
