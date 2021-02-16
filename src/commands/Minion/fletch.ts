import { CommandStore, KlasaMessage } from 'klasa';
import { table } from 'table';

import { Activity, Time } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import Fletching from '../../lib/skilling/skills/fletching';
import { SkillsEnum } from '../../lib/skilling/types';
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
				...Fletching.Fletchables.map(i => [
					i.name,
					`${i.level}`,
					`${i.xp}`,
					`${i.inputItems}`
				])
			]);
			return msg.channel.sendFile(Buffer.from(normalTable), `Fletchables.txt`);
		}

		if (typeof quantity === 'string') {
			fletchName = quantity;
			quantity = null;
		}

		const fletchable = Fletching.Fletchables.find(item => stringMatches(item.name, fletchName));

		if (!fletchable) {
			return msg.send(
				`That is not a valid fletchable item, to see the items available do \`${msg.cmdPrefix}fletch --items\``
			);
		}
		let sets = 'x';
		if (fletchable.outputMultiple) {
			sets = ' sets of';
		}

		if (msg.author.skillLevel(SkillsEnum.Fletching) < fletchable.level) {
			return msg.send(
				`${msg.author.minionName} needs ${fletchable.level} Fletching to fletch ${fletchable.name}.`
			);
		}

		await msg.author.settings.sync(true);
		const userBank = msg.author.bank();

		// Get the base time to fletch the item then add on quarter of a second per item to account for banking/etc.
		let timeToFletchSingleItem = fletchable.tickRate * Time.Second * 0.6 + Time.Second / 4;
		if (fletchable.tickRate < 1) {
			timeToFletchSingleItem = fletchable.tickRate * Time.Second * 0.6;
		}

		if (quantity === null) {
			quantity = Math.floor(msg.author.maxTripLength / timeToFletchSingleItem);
			const max = userBank.fits(fletchable.inputItems);
			if (max < quantity && max !== 0) quantity = max;
		}

		const duration = quantity * timeToFletchSingleItem;
		if (duration > msg.author.maxTripLength) {
			return msg.send(
				`${msg.author.minionName} can't go on trips longer than ${formatDuration(
					msg.author.maxTripLength
				)}, try a lower quantity. The highest amount of ${
					fletchable.name
				}s you can fletch is ${Math.floor(
					msg.author.maxTripLength / timeToFletchSingleItem
				)}.`
			);
		}

		const itemsNeeded = fletchable.inputItems.clone().multiply(quantity);
		if (!userBank.has(itemsNeeded.bank)) {
			return msg.send(
				`You don't have enough items. For ${quantity}x ${
					fletchable.name
				}, you're missing **${itemsNeeded.clone().remove(userBank)}**.`
			);
		}

		await msg.author.removeItemsFromBank(itemsNeeded);

		await addSubTaskToActivityTask<FletchingActivityTaskOptions>(this.client, {
			fletchableName: fletchable.name,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.Fletching
		});

		return msg.send(
			`${msg.author.minionName} is now Fletching ${quantity}${sets} ${
				fletchable.name
			}, it'll take around ${formatDuration(
				duration
			)} to finish. Removed ${itemsNeeded} from your bank.`
		);
	}
}
