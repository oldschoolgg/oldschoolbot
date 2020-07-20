import { CommandStore, KlasaMessage } from 'klasa';
import { BotCommand } from '../../lib/BotCommand';
import {
	stringMatches,
	formatDuration,
	rand,
	itemNameFromID,
	removeItemFromBank,
	bankHasItem
} from '../../lib/util';
import { SkillsEnum } from '../../lib/skilling/types';
import { Time, Activity, Tasks } from '../../lib/constants';
import { CastingActivityTaskOptions } from '../../lib/types/minions';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Magic from '../../lib/skilling/skills/magic/magic';
import { requiresMinion, minionNotBusy } from '../../lib/minions/decorators';

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

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage, [quantity, castName = '']: [null | number | string, string]) {
		if (msg.flagArgs.items) {
			return msg.channel.sendFile(
				Buffer.from(
					Magic.Castables.map(
						item =>
							`${item.name} - lvl ${item.level} : ${Object.entries(item.inputItems)
								.map(entry => `${entry[1]} ${itemNameFromID(parseInt(entry[0]))}`)
								.join(', ')}`
					).join('\n')
				),
				`Available spells.txt`
			);
		}

		if (typeof quantity === 'string') {
			castName = quantity;
			quantity = null;
		}

		const castableItem = Magic.Castables.find(item => stringMatches(item.name, castName));

		if (!castableItem) {
			throw `That is not a valid spell, to see the spells available do \`${msg.cmdPrefix}cast --items\``;
		}
		let sets = 'x';
		if (castableItem.outputMultiple) {
			sets = 'sets of';
		}

		if (msg.author.skillLevel(SkillsEnum.Magic) < castableItem.level) {
			throw `${msg.author.minionName} needs ${castableItem.level} Magic to cast ${castableItem.name}.`;
		}

		await msg.author.settings.sync(true);
		const userBank = msg.author.settings.get(UserSettings.Bank);
		const requiredItems: [string, number][] = Object.entries(castableItem.inputItems);

		// Get the base time to cast a spell then add on quarter of a second per cast to account for dumb minion.
		let timeToCastSingleItem = castableItem.tickRate * Time.Second * 0.6 + Time.Second / 4;
		if (castableItem.tickRate < 1) {
			timeToCastSingleItem = castableItem.tickRate * Time.Second * 0.6;
		}

		// If no quantity provided, set it to the max the player can make by either the items in bank or max time.
		if (quantity === null) {
			quantity = Math.floor(msg.author.maxTripLength / timeToCastSingleItem);
			for (const [itemID, qty] of requiredItems) {
				const itemsOwned = userBank[parseInt(itemID)];
				if (itemsOwned < qty) {
					throw `You dont have enough ${itemNameFromID(parseInt(itemID))}.`;
				}
				quantity = Math.min(quantity, Math.floor(itemsOwned / qty));
			}
		}

		const duration = quantity * timeToCastSingleItem;

		if (duration > msg.author.maxTripLength) {
			throw `${msg.author.minionName} can't go on trips longer than ${formatDuration(
				msg.author.maxTripLength
			)}, try a lower quantity. The highest amount of ${
				castableItem.name
			}s you can cast is ${Math.floor(msg.author.maxTripLength / timeToCastSingleItem)}.`;
		}

		// Check the user has the required items to cast.
		for (const [itemID, qty] of requiredItems) {
			const id = parseInt(itemID);
			if (!bankHasItem(userBank, id, qty * quantity)) {
				throw `You don't have enough ${itemNameFromID(id)}.`;
			}
		}

		const data: CastingActivityTaskOptions = {
			castableName: castableItem.name,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.Casting,
			id: rand(1, 10_000_000),
			finishDate: Date.now() + duration
		};

		// Remove the required items from their bank.
		let newBank = { ...userBank };
		for (const [itemID, qty] of requiredItems) {
			newBank = removeItemFromBank(newBank, parseInt(itemID), qty * quantity);
		}
		await msg.author.settings.update(UserSettings.Bank, newBank);

		await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);

		return msg.send(
			`${msg.author.minionName} is now Casting ${quantity} ${sets} ${
				castableItem.name
			}s, it'll take around ${formatDuration(duration)} to finish.`
		);
	}
}
