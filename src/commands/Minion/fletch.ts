import { MessageAttachment } from 'discord.js';
import { Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { table } from 'table';

import { Activity } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Fletching from '../../lib/skilling/skills/fletching';
import { SkillsEnum } from '../../lib/skilling/types';
import { SlayerTaskUnlocksEnum } from '../../lib/slayer/slayerUnlocks';
import { hasSlayerUnlock } from '../../lib/slayer/slayerUtil';
import { BotCommand } from '../../lib/structures/BotCommand';
import { FletchingActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

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
			const normalTable = table([
				['Item Name', 'Lvl', 'XP', 'Items Required'],
				...Fletching.Fletchables.map(i => [i.name, `${i.level}`, `${i.xp}`, `${i.inputItems}`])
			]);
			return msg.channel.send({ files: [new MessageAttachment(Buffer.from(normalTable), 'Fletchables.txt')] });
		}

		if (typeof quantity === 'string') {
			fletchName = quantity;
			quantity = null;
		}

		const fletchable = Fletching.Fletchables.find(item => stringMatches(item.name, fletchName));

		if (!fletchable) {
			return msg.channel.send(
				`That is not a valid fletchable item, to see the items available do \`${msg.cmdPrefix}fletch --items\``
			);
		}
		let sets = 'x';
		if (fletchable.outputMultiple) {
			sets = ' sets of';
		}

		if (msg.author.skillLevel(SkillsEnum.Fletching) < fletchable.level) {
			return msg.channel.send(
				`${msg.author.minionName} needs ${fletchable.level} Fletching to fletch ${fletchable.name}.`
			);
		}

		if (fletchable.requiredSlayerUnlocks) {
			let mySlayerUnlocks = msg.author.settings.get(UserSettings.Slayer.SlayerUnlocks);

			const { success, errors } = hasSlayerUnlock(
				mySlayerUnlocks as SlayerTaskUnlocksEnum[],
				fletchable.requiredSlayerUnlocks
			);
			if (!success) {
				throw `You don't have the required Slayer Unlocks to create this item.\n\nRequired: ${errors}`;
			}
		}

		await msg.author.settings.sync(true);
		const userBank = msg.author.bank();

		// Get the base time to fletch the item then add on quarter of a second per item to account for banking/etc.
		let timeToFletchSingleItem = fletchable.tickRate * Time.Second * 0.6 + Time.Second / 4;
		if (fletchable.tickRate < 1) {
			timeToFletchSingleItem = fletchable.tickRate * Time.Second * 0.6;
		}

		const maxTripLength = msg.author.maxTripLength(Activity.Fletching);
		const quantitySpecified = quantity !== null;

		if (quantity === null) {
			quantity = Math.floor(maxTripLength / timeToFletchSingleItem);
			const max = userBank.fits(fletchable.inputItems);
			if (max < quantity && max !== 0) quantity = max;
		}

		const duration = quantity * timeToFletchSingleItem;
		if (duration > maxTripLength) {
			return msg.channel.send(
				`${msg.author.minionName} can't go on trips longer than ${formatDuration(
					maxTripLength
				)}, try a lower quantity. The highest amount of ${fletchable.name}s you can fletch is ${Math.floor(
					maxTripLength / timeToFletchSingleItem
				)}.`
			);
		}

		const itemsNeeded = fletchable.inputItems.clone().multiply(quantity);
		if (!userBank.has(itemsNeeded.bank)) {
			return msg.channel.send(
				`You don't have enough items. For ${quantity}x ${fletchable.name}, you're missing **${itemsNeeded
					.clone()
					.remove(userBank)}**.`
			);
		}

		await msg.author.removeItemsFromBank(itemsNeeded);

		await addSubTaskToActivityTask<FletchingActivityTaskOptions>({
			fletchableName: fletchable.name,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.Fletching,
			quantitySpecified
		});

		return msg.channel.send(
			`${msg.author.minionName} is now Fletching ${quantity}${sets} ${
				fletchable.name
			}, it'll take around ${formatDuration(duration)} to finish. Removed ${itemsNeeded} from your bank.`
		);
	}
}
