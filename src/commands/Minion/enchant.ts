import { CommandStore, KlasaMessage } from 'klasa';

import { Activity, Time } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { Enchantables } from '../../lib/skilling/skills/magic/enchantables';
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
			description: 'Sends your minion to enchant items.',
			examples: ['+enchant 100 opal bolts', '+enchant ruby bolts'],
			categoryFlags: ['minion', 'skilling']
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage, [quantity, name = '']: [null | number | string, string]) {
		if (typeof quantity === 'string') {
			name = quantity;
			quantity = null;
		}

		const enchantable = Enchantables.find(item => stringMatches(item.name, name));

		if (!enchantable) {
			return msg.send(
				`That is not a valid item to enchant, the items you can enchant are: ${Enchantables.map(
					i => i.name
				).join(', ')}.`
			);
		}

		if (msg.author.skillLevel(SkillsEnum.Magic) < enchantable.level) {
			return msg.send(
				`${msg.author.minionName} needs ${enchantable.level} Magic to enchant ${enchantable.name}.`
			);
		}

		await msg.author.settings.sync(true);
		const userBank = msg.author.bank();

		let timeToEnchantTen = 3 * Time.Second * 0.6 + Time.Second / 4;

		if (quantity === null) {
			quantity = Math.floor(msg.author.maxTripLength / timeToEnchantTen);
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
					enchantable.name
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
			fletchableName: enchantable.name,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.Fletching
		});

		return msg.send(
			`${msg.author.minionName} is now Fletching ${quantity} ${sets} ${
				enchantable.name
			}s, it'll take around ${formatDuration(duration)} to finish.`
		);
	}
}
