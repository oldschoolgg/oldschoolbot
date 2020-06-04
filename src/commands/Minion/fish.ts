import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, Tasks, Time } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Fishing from '../../lib/skilling/skills/fishing';
import { SkillsEnum } from '../../lib/skilling/types';
import { FishingActivityTaskOptions } from '../../lib/types/minions';
import {
	calcPercentOfNum,
	formatDuration,
	itemID,
	rand,
	removeItemFromBank,
	stringMatches
} from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import checkActivityQuantity from '../../lib/util/checkActivityQuantity';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '[quantity:int{1}] <fishName:...string>',
			usageDelim: ' '
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage, [quantity, name]: [number, string]) {
		await msg.author.settings.sync(true);

		const fish = Fishing.Fishes.find(
			fish => stringMatches(fish.name, name) || stringMatches(fish.name.split(' ')[0], name)
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

		if (fish.name === 'Barbarian fishing' && msg.author.skillLevel(SkillsEnum.Agility) < 15) {
			return msg.send(`You need at least 15 Agility to catch those!`);
		}

		let scaledTimePerFish =
			Time.Second *
			fish.timePerFish *
			(1 + (100 - msg.author.skillLevel(SkillsEnum.Fishing)) / 100);

		const boosts = [];
		if (msg.author.hasItemEquippedAnywhere(itemID('Crystal harpoon'))) {
			scaledTimePerFish *= 0.95;
			boosts.push(`5% for Crystal harpoon`);
		}

		if (fish.bait) {
			quantity = checkActivityQuantity(msg.author, quantity, scaledTimePerFish, fish.bait);
		} else {
			quantity = checkActivityQuantity(msg.author, quantity, scaledTimePerFish);
		}
		let duration = quantity * scaledTimePerFish;

		const tenPercent = Math.floor(calcPercentOfNum(10, duration));
		duration += rand(-tenPercent, tenPercent);

		// Remove the bait from their bank.
		if (fish.bait) {
			const userBank = msg.author.settings.get(UserSettings.Bank);
			// Remove the bait from their bank.
			let newBank = { ...userBank };
			for (const [itemID, qty] of Object.entries(fish.bait)) {
				newBank = removeItemFromBank(newBank, parseInt(itemID), qty * quantity);
			}
			await msg.author.settings.update(UserSettings.Bank, newBank);
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

		let response = `${msg.author.minionName} is now fishing ${quantity}x ${
			fish.name
		}, it'll take around ${formatDuration(duration)} to finish.`;

		if (boosts.length > 0) {
			response += `\n\n**Boosts:** ${boosts.join(', ')}.`;
		}

		return msg.send(response);
	}
}
