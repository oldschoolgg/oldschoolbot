import { Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, Tasks } from '../../lib/constants';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Fishing from '../../lib/skilling/skills/fishing';
import { SkillsEnum } from '../../lib/skilling/types';
import { FishingActivityTaskOptions } from '../../lib/types/minions';
import {
	calcPercentOfNum,
	formatDuration,
	itemID,
	itemNameFromID,
	rand,
	stringMatches
} from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

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

	async run(msg: KlasaMessage, [quantity, name = '']: [null | number | string, string]) {
		if (!msg.author.hasMinion) {
			throw `You dont have a minion`;
		}

		if (msg.author.minionIsBusy) {
			return msg.send(msg.author.minionStatus);
		}

		if (typeof quantity === 'string') {
			name = quantity;
			quantity = null;
		}

		const fish = Fishing.Fishes.find(
			fish => stringMatches(fish.name, name) || stringMatches(fish.name.split(' ')[0], name)
		);

		if (!fish) {
			throw `Thats not a valid fish to catch. Valid fishes are ${Fishing.Fishes.map(
				fish => fish.name
			).join(', ')}.`;
		}

		if (msg.author.skillLevel(SkillsEnum.Fishing) < fish.level) {
			throw `${msg.author.minionName} needs ${fish.level} Fishing to fish ${fish.name}.`;
		}

		if (fish.qpRequired) {
			if (msg.author.settings.get(UserSettings.QP) < fish.qpRequired) {
				throw `You need ${fish.qpRequired} qp to catch those!`;
			}
		}

		if (fish.name === 'Barbarian fishing' && msg.author.skillLevel(SkillsEnum.Agility) < 15) {
			throw `You need at least 15 Agility to catch those!`;
		}

		// If no quantity provided, set it to the max.
		let scaledTimePerFish =
			Time.Second *
			fish.timePerFish *
			(1 + (100 - msg.author.skillLevel(SkillsEnum.Fishing)) / 100);

		const hasShelldon = msg.author.equippedPet() === itemID('Shelldon');
		if (hasShelldon) {
			scaledTimePerFish /= 2;
		}

		let { maxTripLength } = msg.author;
		if (msg.author.hasItemEquippedAnywhere(itemID('Fish sack'))) {
			maxTripLength += Time.Minute * 9;
		}

		if (quantity === null) {
			quantity = Math.floor(maxTripLength / scaledTimePerFish);
		}

		let duration = quantity * scaledTimePerFish;

		if (duration > msg.author.maxTripLength) {
			throw `${msg.author.minionName} can't go on trips longer than ${formatDuration(
				msg.author.maxTripLength
			)}, try a lower quantity. The highest amount of ${
				fish.name
			} you can fish is ${Math.floor(msg.author.maxTripLength / scaledTimePerFish)}.`;
		}

		if (fish.bait) {
			const hasBait = await msg.author.hasItem(fish.bait, quantity);
			if (!hasBait) {
				throw `You need ${itemNameFromID(fish.bait)} to fish ${fish.name}!`;
			}
		}

		const tenPercent = Math.floor(calcPercentOfNum(10, duration));
		duration += rand(-tenPercent, tenPercent);

		// Remove the bait from their bank.
		if (fish.bait) {
			await msg.author.removeItemFromBank(fish.bait, quantity);
		}

		await addSubTaskToActivityTask<FishingActivityTaskOptions>(
			this.client,
			Tasks.SkillingTicker,
			{
				fishID: fish.id,
				userID: msg.author.id,
				channelID: msg.channel.id,
				quantity,
				duration,
				type: Activity.Fishing
			}
		);

		const response = `${msg.author.minionName} is now fishing ${quantity}x ${
			fish.name
		}, it'll take around ${formatDuration(duration)} to finish. ${
			hasShelldon
				? `\n<:shelldon:748496988407988244> ${msg.author.minionName} picks up Shelldon to help them fish!`
				: ''
		}`;

		return msg.send(response);
	}
}
