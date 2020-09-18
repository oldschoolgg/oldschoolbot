import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, Tasks, Time } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Skills from '../../lib/skilling/skills';
import { SkillsEnum } from '../../lib/skilling/types';
import {
	FletchingActivityTaskOptions,
	PickpocketingActivityTaskOptions
} from '../../lib/types/minions';
import {
	bankHasItem,
	formatDuration,
	itemNameFromID,
	rand,
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

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage, [quantity, name = '']: [null | number | string, string]) {
		if (typeof quantity === 'string') {
			name = quantity;
			quantity = null;
		}

		const pickpocketable = Skills.Thieving.id.find(item => stringMatches(item.name, name));

		if (!pickpocketable) {
			throw `That is not a valid fletchable item, to see the items available do \`${msg.cmdPrefix}fletch --items\``;
		}
		let sets = 'x';
		if (pickpocketable.outputMultiple) {
			sets = 'sets of';
		}

		if (msg.author.skillLevel(SkillsEnum.Fletching) < pickpocketable.level) {
			throw `${msg.author.minionName} needs ${pickpocketable.level} Fletching to fletch ${pickpocketable.name}.`;
		}

		await msg.author.settings.sync(true);
		const userBank = msg.author.settings.get(UserSettings.Bank);
		const requiredItems: [string, number][] = Object.entries(pickpocketable.inputItems);

		// Get the base time to fletch the item then add on quarter of a second per item to account for banking/etc.
		let timeToFletchSingleItem = pickpocketable.tickRate * Time.Second * 0.6 + Time.Second / 4;
		if (pickpocketable.tickRate < 1) {
			timeToFletchSingleItem = pickpocketable.tickRate * Time.Second * 0.6;
		}

		// If no quantity provided, set it to the max the player can make by either the items in bank or max time.
		if (quantity === null) {
			quantity = Math.floor(msg.author.maxTripLength / timeToFletchSingleItem);
		}

		const duration = quantity * timeToFletchSingleItem;

		if (duration > msg.author.maxTripLength) {
			throw `${msg.author.minionName} can't go on trips longer than ${formatDuration(
				msg.author.maxTripLength
			)}, try a lower quantity. The highest amount of ${
				pickpocketable.name
			}s you can fletch is ${Math.floor(msg.author.maxTripLength / timeToFletchSingleItem)}.`;
		}

		const data: PickpocketingActivityTaskOptions = {
			fletchableName: pickpocketable.name,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.Fletching,
			id: rand(1, 10_000_000),
			finishDate: Date.now() + duration
		};

		await msg.author.settings.update(UserSettings.Bank, newBank);

		await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);

		return msg.send(
			`${msg.author.minionName} is now Fletching ${quantity} ${sets} ${
				pickpocketable.name
			}s, it'll take around ${formatDuration(duration)} to finish.`
		);
	}
}
