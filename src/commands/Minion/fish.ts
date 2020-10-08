import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, Time } from '../../lib/constants';
import { Listeners } from '../../lib/PgBoss/PgBoss';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Fishing from '../../lib/skilling/skills/fishing';
import { SkillsEnum } from '../../lib/skilling/types';
import { FishingActivityJobOptions } from '../../lib/types/minions';
import {
	calcPercentOfNum,
	formatDuration,
	itemNameFromID,
	rand,
	stringMatches
} from '../../lib/util';
import addNewJob from '../../lib/util/addNewJob';

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
		const scaledTimePerFish =
			Time.Second *
			fish.timePerFish *
			(1 + (100 - msg.author.skillLevel(SkillsEnum.Fishing)) / 100);

		if (quantity === null) {
			quantity = Math.floor(msg.author.maxTripLength / scaledTimePerFish);
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

		await addNewJob<FishingActivityJobOptions>(this.client, Listeners.SkillingEvent, {
			fishID: fish.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.Fishing
		});

		const response = `${msg.author.minionName} is now fishing ${quantity}x ${
			fish.name
		}, it'll take around ${formatDuration(duration)} to finish.`;

		return msg.send(response);
	}
}
