import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, Events, Tasks, Time } from '../../lib/constants';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Smithing from '../../lib/skilling/skills/smithing';
import { SkillsEnum } from '../../lib/skilling/types';
import { SmithingActivityTaskOptions } from '../../lib/types/minions';
import {
	bankHasItem,
	formatDuration,
	itemNameFromID,
	removeItemFromBank,
	stringMatches
} from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '[quantity:int{1}|name:...string] [name:...string]',
			usageDelim: ' '
		});
	}

	async run(msg: KlasaMessage, [quantity, smithableItem = '']: [null | number | string, string]) {
		if (!msg.author.hasMinion) {
			throw `You dont have a minion`;
		}
		if (msg.flagArgs.items) {
			return msg.channel.sendFile(
				Buffer.from(
					Smithing.SmithableItems.map(
						item =>
							`${item.name} - lvl ${item.level} : ${Object.entries(item.inputBars)
								.map(entry => `${entry[1]} ${itemNameFromID(parseInt(entry[0]))}`)
								.join(', ')}`
					).join('\n')
				),
				`Available Smithing items.txt`
			);
		}

		if (msg.author.minionIsBusy) {
			return msg.send(msg.author.minionStatus);
		}

		if (typeof quantity === 'string') {
			smithableItem = quantity;
			quantity = null;
		}

		const smithedItem = Smithing.SmithableItems.find(
			_smithedItem =>
				stringMatches(_smithedItem.name, smithableItem) ||
				stringMatches(_smithedItem.name.split(' ')[0], smithableItem)
		);

		if (!smithedItem) {
			throw `That is not a valid item to smith, to see the items availible do \`${msg.cmdPrefix}smith --items\``;
		}

		if (msg.author.skillLevel(SkillsEnum.Smithing) < smithedItem.level) {
			throw `${msg.author.minionName} needs ${smithedItem.level} Smithing to smith ${smithedItem.name}s.`;
		}

		// Time to smith an item, add on quarter of a second to account for banking/etc.
		const timeToSmithSingleBar = smithedItem.timeToUse + Time.Second / 4;

		// If no quantity provided, set it to the max.
		if (quantity === null) {
			quantity = Math.floor(msg.author.maxTripLength / timeToSmithSingleBar);
		}

		await msg.author.settings.sync(true);
		const userBank = msg.author.settings.get(UserSettings.Bank);

		// Check the user has the required bars to smith these itemss.
		// Multiplying the bars required by the quantity of items.
		const requiredBars: [string, number][] = Object.entries(smithedItem.inputBars);
		for (const [barID, qty] of requiredBars) {
			if (!bankHasItem(userBank, parseInt(barID), qty * quantity)) {
				throw `You don't have enough ${itemNameFromID(parseInt(barID))}.`;
			}
		}

		const duration = quantity * timeToSmithSingleBar;

		if (duration > msg.author.maxTripLength) {
			throw `${msg.author.minionName} can't go on trips longer than ${formatDuration(
				msg.author.maxTripLength
			)}, try a lower quantity. The highest amount of ${
				smithedItem.name
			}s you can smith is ${Math.floor(msg.author.maxTripLength / timeToSmithSingleBar)}.`;
		}

		// Remove the bars from their bank.
		let usedbars = 0;
		let newBank = { ...userBank };
		for (const [barID, qty] of requiredBars) {
			if (newBank[parseInt(barID)] < qty) {
				this.client.emit(
					Events.Wtf,
					`${msg.author.sanitizedName} had insufficient bars to be removed.`
				);
				throw `What a terrible failure :(`;
			}
			newBank = removeItemFromBank(newBank, parseInt(barID), qty * quantity);
			usedbars = qty * quantity;
		}

		await addSubTaskToActivityTask<SmithingActivityTaskOptions>(
			this.client,
			Tasks.SkillingTicker,
			{
				smithedBarID: smithedItem.id,
				userID: msg.author.id,
				channelID: msg.channel.id,
				quantity,
				duration,
				type: Activity.Smithing
			}
		);
		await msg.author.settings.update(UserSettings.Bank, newBank);

		return msg.send(
			`${msg.author.minionName} is now smithing ${quantity * smithedItem.outputMultiple}x ${
				smithedItem.name
			}, using ${usedbars} bars, it'll take around ${formatDuration(duration)} to finish.`
		);
	}
}
