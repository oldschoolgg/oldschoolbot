import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import {
	stringMatches,
	formatDuration,
	rand,
	itemNameFromID,
	removeItemFromBank
} from '../../lib/util';
import { SkillsEnum } from '../../lib/skilling/types';
import { Time, Activity, Tasks, Events } from '../../lib/constants';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import Smithing from '../../lib/skilling/skills/smithedItems';
import bankHasItem from '../../lib/util/bankHasItem';
import { UserSettings } from '../../lib/UserSettings';
import { SmithedActivityTaskOptions } from '../../lib/types/minions';

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

	async run(
		msg: KlasaMessage,
		[quantity, smithedBarName = '']: [null | number | string, string]
	) {
		if (!msg.author.hasMinion) {
			throw `You dont have a minion`;
		}
		if (msg.flagArgs.items) {
			return msg.channel.sendFile(
				Buffer.from(
					Smithing.SmithedBars.map(
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
			smithedBarName = quantity;
			quantity = null;
		}

		const smithedBar = Smithing.SmithedBars.find(
			smithedBar =>
				stringMatches(smithedBar.name, smithedBarName) ||
				stringMatches(smithedBar.name.split(' ')[0], smithedBarName)
		);

		if (!smithedBar) {
			throw `That is not a valid craftable item, to see the items availible do \`${msg.cmdPrefix}smithed --items\``;
		}

		if (msg.author.skillLevel(SkillsEnum.Smithing) < smithedBar.level) {
			throw `${msg.author.minionName} needs ${smithedBar.level} Smithing to smith ${smithedBar.name}s.`;
		}

		// Time to smith an item, add on quarter of a second to account for banking/etc.
		const timeToSmithSingleBar = smithedBar.timeToUse + Time.Second / 4;

		// If no quantity provided, set it to the max.
		if (quantity === null) {
			quantity = Math.floor((Time.Minute * 30) / timeToSmithSingleBar);
		}

		await msg.author.settings.sync(true);
		const userBank = msg.author.settings.get(UserSettings.Bank);

		// Check the user has the required bars to smith these itemss.
		// Multiplying the bars required by the quantity of items.
		const requiredBars: [string, number][] = Object.entries(smithedBar.inputBars);
		for (const [barID, qty] of requiredBars) {
			if (!bankHasItem(userBank, parseInt(barID), qty * quantity)) {
				throw `You don't have enough ${itemNameFromID(parseInt(barID))}.`;
			}
		}

		const duration = quantity * timeToSmithSingleBar;

		if (duration > Time.Minute * 30) {
			throw `${
				msg.author.minionName
			} can't go on trips longer than 30 minutes, try a lower quantity. The highest amount of ${
				smithedBar.name
			}s you can smith is ${Math.floor((Time.Minute * 30) / timeToSmithSingleBar)}.`;
		}

		const data: SmithedActivityTaskOptions = {
			smithedBarID: smithedBar.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.Smithed,
			id: rand(1, 10_000_000),
			finishDate: Date.now() + duration
		};

		// Remove the bars from their bank.
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
		}

		await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);
		await msg.author.settings.update(UserSettings.Bank, newBank);

		msg.author.incrementMinionDailyDuration(duration);
		return msg.send(
			`${msg.author.minionName} is now smithing ${quantity * smithedBar.outputMultiple}x ${
				smithedBar.name
			}, it'll take around ${formatDuration(duration)} to finish.`
		);
	}
}
