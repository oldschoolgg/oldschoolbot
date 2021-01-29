import { CommandStore, KlasaMessage } from 'klasa';

import { Activity, Time } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Fletching from '../../lib/skilling/skills/fletching';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { FletchingActivityTaskOptions } from '../../lib/types/minions';
import {
	bankHasItem,
	formatDuration,
	itemNameFromID,
	removeItemFromBank,
	stringMatches
} from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import getOSItem from '../../lib/util/getOSItem';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '[quantity:int{1}|name:...string] [name:...string]',
			usageDelim: ' ',
			description: 'Sends your minion to fletch items.',
			examples: ['+fletch shortbow (u)', '+fletch 5 Oak shield'],
			categoryFlags: ['minion', 'skilling']
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage, [quantity, fletchName = '']: [null | number | string, string]) {
		if (msg.flagArgs.items) {
			return msg.channel.sendFile(
				Buffer.from(
					Fletching.Fletchables.map(
						item =>
							`${item.name} - lvl ${item.level} : ${Object.entries(item.inputItems)
								.map(entry => `${entry[1]} ${itemNameFromID(parseInt(entry[0]))}`)
								.join(', ')}`
					).join('\n')
				),
				`Available fletching items.txt`
			);
		}

		if (typeof quantity === 'string') {
			fletchName = quantity;
			quantity = null;
		}

		const fletchableItem = Fletching.Fletchables.find(item =>
			stringMatches(item.name, fletchName)
		);

		if (!fletchableItem) {
			return msg.send(
				`That is not a valid fletchable item, to see the items available do \`${msg.cmdPrefix}fletch --items\``
			);
		}
		let sets = 'x';
		if (fletchableItem.outputMultiple) {
			sets = 'sets of';
		}

		if (msg.author.skillLevel(SkillsEnum.Fletching) < fletchableItem.level) {
			return msg.send(
				`${msg.author.minionName} needs ${fletchableItem.level} Fletching to fletch ${fletchableItem.name}.`
			);
		}

		await msg.author.settings.sync(true);
		const userBank = msg.author.settings.get(UserSettings.Bank);
		const requiredItems: [string, number][] = Object.entries(fletchableItem.inputItems);

		// Get the base time to fletch the item then add on quarter of a second per item to account for banking/etc.
		let timeToFletchSingleItem = fletchableItem.tickRate * Time.Second * 0.6 + Time.Second / 4;
		if (fletchableItem.tickRate < 1) {
			timeToFletchSingleItem = fletchableItem.tickRate * Time.Second * 0.6;
		}

		// If no quantity provided, set it to the max the player can make by either the items in bank or max time.
		if (quantity === null) {
			quantity = Math.floor(msg.author.maxTripLength / timeToFletchSingleItem);
			for (const [itemID, qty] of requiredItems) {
				const itemsOwned = userBank[getOSItem(itemID).id] ?? 0;
				if (itemsOwned < qty) {
					return msg.send(`You dont have enough **${getOSItem(itemID).name}**.`);
				}
				quantity = Math.min(quantity, Math.floor(itemsOwned / qty));
			}
		}
		const duration = quantity * timeToFletchSingleItem;

		if (duration > msg.author.maxTripLength) {
			return msg.send(
				`${msg.author.minionName} can't go on trips longer than ${formatDuration(
					msg.author.maxTripLength
				)}, try a lower quantity. The highest amount of ${
					fletchableItem.name
				}s you can fletch is ${Math.floor(
					msg.author.maxTripLength / timeToFletchSingleItem
				)}.`
			);
		}

		// Check the user has the required items to fletch.
		for (const [itemID, qty] of requiredItems) {
			const { id } = getOSItem(itemID);
			if (!bankHasItem(userBank, id, qty * quantity)) {
				return msg.send(`You don't have enough **${itemNameFromID(id)}**.`);
			}
		}

		// Remove the required items from their bank.
		let newBank = { ...userBank };
		for (const [itemID, qty] of requiredItems) {
			newBank = removeItemFromBank(newBank, parseInt(itemID), qty * quantity);
		}
		await msg.author.settings.update(UserSettings.Bank, newBank);

		await addSubTaskToActivityTask<FletchingActivityTaskOptions>(this.client, {
			fletchableName: fletchableItem.name,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.Fletching
		});

		return msg.send(
			`${msg.author.minionName} is now Fletching ${quantity} ${sets} ${
				fletchableItem.name
			}s, it'll take around ${formatDuration(duration)} to finish.`
		);
	}
}
