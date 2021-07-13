import { MessageAttachment } from 'discord.js';
import { Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { Activity } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Smithing from '../../lib/skilling/skills/smithing';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { SmithingActivityTaskOptions } from '../../lib/types/minions';
import { bankHasItem, formatDuration, itemNameFromID, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			usage: '[quantity:int{1}|name:...string] [name:...string]',
			usageDelim: ' ',
			categoryFlags: ['minion', 'skilling'],
			description:
				'Sends your minion to smith items, which is turning bars into smithed items, like weapons and armor.',
			examples: ['+smith mithril sword', '+smith rune platebody']
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage, [quantity, smithableItem = '']: [null | number | string, string]) {
		if (msg.flagArgs.items) {
			return msg.channel.send({
				files: [
					new MessageAttachment(
						Buffer.from(
							Smithing.SmithableItems.map(
								item =>
									`${item.name} - lvl ${item.level} : ${Object.entries(item.inputBars)
										.map(entry => `${entry[1]} ${itemNameFromID(parseInt(entry[0]))}`)
										.join(', ')}`
							).join('\n')
						),
						'Available Smithing items.txt'
					)
				]
			});
		}

		if (typeof quantity === 'string') {
			smithableItem = quantity;
			quantity = null;
		}

		const smithedItem = Smithing.SmithableItems.find(_smithedItem =>
			stringMatches(_smithedItem.name, smithableItem)
		);

		if (!smithedItem) {
			return msg.channel.send(
				`That is not a valid item to smith, to see the items availible do \`${msg.cmdPrefix}smith --items\``
			);
		}

		if (msg.author.skillLevel(SkillsEnum.Smithing) < smithedItem.level) {
			return msg.channel.send(
				`${msg.author.minionName} needs ${smithedItem.level} Smithing to smith ${smithedItem.name}s.`
			);
		}

		// Time to smith an item, add on quarter of a second to account for banking/etc.
		const timeToSmithSingleBar = smithedItem.timeToUse + Time.Second / 4;

		let maxTripLength = msg.author.maxTripLength(Activity.Smithing);
		if (smithedItem.name === 'Cannonball') {
			maxTripLength = Time.Hour;
		}

		// If no quantity provided, set it to the max.
		if (quantity === null) {
			quantity = Math.floor(maxTripLength / timeToSmithSingleBar);
		}

		await msg.author.settings.sync(true);
		const userBank = msg.author.settings.get(UserSettings.Bank);

		// Check the user has the required bars to smith these itemss.
		// Multiplying the bars required by the quantity of items.
		let curMin = Infinity;
		const requiredBars: [string, number][] = Object.entries(smithedItem.inputBars);
		for (const [barID, qty] of requiredBars) {
			if (!bankHasItem(userBank, parseInt(barID), qty * quantity)) {
				let itemQty = userBank[parseInt(barID)] ?? 0;
				if (Math.floor(itemQty / qty) < curMin) curMin = Math.floor(itemQty / qty);
				if (curMin === 0) {
					return msg.channel.send(
						`You don't have enough ${itemNameFromID(parseInt(barID))}'s to smith ${quantity}x ${
							smithedItem.name
						}, you need atleast ${qty}.`
					);
				}
			}
		}
		quantity = curMin;
		const duration = quantity * timeToSmithSingleBar;
		if (duration > maxTripLength) {
			return msg.channel.send(
				`${msg.author.minionName} can't go on trips longer than ${formatDuration(
					maxTripLength
				)}, try a lower quantity. The highest amount of ${smithedItem.name}s you can smith is ${Math.floor(
					maxTripLength / timeToSmithSingleBar
				)}.`
			);
		}

		// Remove the bars from their bank.
		let usedbars = 0;
		let newBank = { ...userBank };
		let costBank = new Bank();
		for (const [barID, qty] of requiredBars) {
			if (newBank[parseInt(barID)] < qty) {
				this.client.wtf(new Error(`${msg.author.sanitizedName} had insufficient bars to be removed.`));
				return;
			}
			costBank.add(parseInt(barID), qty * quantity);
			await msg.author.removeItemsFromBank(costBank);
			usedbars = qty * quantity;
		}

		await addSubTaskToActivityTask<SmithingActivityTaskOptions>({
			smithedBarID: smithedItem.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.Smithing
		});

		return msg.channel.send(
			`${msg.author.minionName} is now smithing ${quantity * smithedItem.outputMultiple}x ${
				smithedItem.name
			}, using ${usedbars} bars, it'll take around ${formatDuration(duration)} to finish.`
		);
	}
}
