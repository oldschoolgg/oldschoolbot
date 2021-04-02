import { CommandStore, KlasaMessage } from 'klasa';

import { Activity, Time } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Fishing from '../../lib/skilling/skills/fishing';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
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
			usageDelim: ' ',
			description: 'Sends your minion to fish.',
			examples: ['+fish raw shrimps'],
			categoryFlags: ['minion', 'skilling']
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage, [quantity, name = '']: [null | number | string, string]) {
		if (typeof quantity === 'string') {
			name = quantity;
			quantity = null;
		}

		const fish = Fishing.Fishes.find(
			fish =>
				stringMatches(fish.name, name) ||
				stringMatches(fish.name.split(' ')[0], name) ||
				(fish.aliases && fish.aliases.some(alias => stringMatches(alias, name)))
		);

		if (!fish) {
			return msg.send(
				`Thats not a valid fish to catch. Valid fishes are ${Fishing.Fishes.map(
					fish => fish.name
				).join(', ')}.`
			);
		}

		if (msg.author.skillLevel(SkillsEnum.Fishing) < fish.level) {
			return msg.send(
				`${msg.author.minionName} needs ${fish.level} Fishing to fish ${fish.name}.`
			);
		}

		if (fish.qpRequired) {
			if (msg.author.settings.get(UserSettings.QP) < fish.qpRequired) {
				return msg.send(`You need ${fish.qpRequired} qp to catch those!`);
			}
		}

		if (
			fish.name === 'Barbarian fishing' &&
			(msg.author.skillLevel(SkillsEnum.Agility) < 15 ||
				msg.author.skillLevel(SkillsEnum.Strength) < 15)
		) {
			return msg.send(`You need at least 15 Agility and Strength to do Barbarian Fishing.`);
		}

		// If no quantity provided, set it to the max.
		let scaledTimePerFish =
			Time.Second *
			fish.timePerFish *
			(1 + (100 - msg.author.skillLevel(SkillsEnum.Fishing)) / 100);

		const boosts = [];

		const hasShelldon = msg.author.equippedPet() === itemID('Shelldon');
		if (hasShelldon) {
			scaledTimePerFish /= 2;
		}

		switch (fish.bait) {
			case itemID('Fishing bait'):
				if (msg.author.hasItemEquippedAnywhere(itemID('Pearl fishing rod'))) {
					scaledTimePerFish *= 0.95;
					boosts.push(`5% for Pearl fishing rod`);
				}
				break;
			case itemID('Feather'):
				if (
					fish.name === 'Barbarian fishing' &&
					msg.author.hasItemEquippedAnywhere(itemID('Pearl barbarian rod'))
				) {
					scaledTimePerFish *= 0.95;
					boosts.push(`5% for Pearl barbarian rod`);
				} else if (
					msg.author.hasItemEquippedAnywhere(itemID('Pearl fly fishing rod')) &&
					fish.name !== 'Barbarian fishing'
				) {
					scaledTimePerFish *= 0.95;
					boosts.push(`5% for Pearl fly fishing rod`);
				}
				break;
			default:
				if (msg.author.hasItemEquippedAnywhere(itemID('Crystal harpoon'))) {
					scaledTimePerFish *= 0.95;
					boosts.push(`5% for Crystal harpoon`);
				}
				break;
		}

		const maxTripLength = msg.author.maxTripLength(Activity.Fishing);

		if (quantity === null) {
			quantity = Math.floor(maxTripLength / scaledTimePerFish);
		}

		let duration = quantity * scaledTimePerFish;

		if (duration > maxTripLength) {
			return msg.send(
				`${msg.author.minionName} can't go on trips longer than ${formatDuration(
					maxTripLength
				)}, try a lower quantity. The highest amount of ${
					fish.name
				} you can fish is ${Math.floor(maxTripLength / scaledTimePerFish)}.`
			);
		}

		if (fish.bait) {
			const hasBait = await msg.author.hasItem(fish.bait, quantity);
			if (!hasBait) {
				return msg.send(`You need ${itemNameFromID(fish.bait)} to fish ${fish.name}!`);
			}
		}

		const tenPercent = Math.floor(calcPercentOfNum(10, duration));
		duration += rand(-tenPercent, tenPercent);

		// Remove the bait from their bank.
		if (fish.bait) {
			await msg.author.removeItemFromBank(fish.bait, quantity);
		}

		await addSubTaskToActivityTask<FishingActivityTaskOptions>(this.client, {
			fishID: fish.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.Fishing
		});

		let response = `${msg.author.minionName} is now fishing ${quantity}x ${
			fish.name
		}, it'll take around ${formatDuration(duration)} to finish. ${
			hasShelldon
				? `\n<:shelldon:748496988407988244> ${msg.author.minionName} picks up Shelldon to help them fish!`
				: ''
		}`;

		if (boosts.length > 0) {
			response += `\n\n**Boosts:** ${boosts.join(', ')}.`;
		}

		return msg.send(response);
	}
}
