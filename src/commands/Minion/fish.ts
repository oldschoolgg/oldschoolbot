import { calcPercentOfNum, Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';
import TzTokJad from 'oldschooljs/dist/simulation/monsters/special/TzTokJad';

import { Favours, gotFavour } from '../../lib/minions/data/kourendFavour';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Fishing from '../../lib/skilling/skills/fishing';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { FishingActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, itemID, itemNameFromID, rand, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
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

		await msg.author.settings.sync(true);
		const fish = Fishing.Fishes.find(
			fish => stringMatches(fish.name, name) || fish.alias?.some(alias => stringMatches(alias, name))
		);
		if (!fish) {
			return msg.channel.send(
				`Thats not a valid fish to catch. Valid fishes are ${Fishing.Fishes.map(fish => fish.name).join(', ')}.`
			);
		}

		if (msg.author.skillLevel(SkillsEnum.Fishing) < fish.level) {
			return msg.channel.send(`${msg.author.minionName} needs ${fish.level} Fishing to fish ${fish.name}.`);
		}

		if (fish.qpRequired) {
			if (msg.author.settings.get(UserSettings.QP) < fish.qpRequired) {
				return msg.channel.send(`You need ${fish.qpRequired} qp to catch those!`);
			}
		}
		const [hasFavour, requiredPoints] = gotFavour(msg.author, Favours.Piscarilius, 100);
		if (!hasFavour && fish.name === 'Anglerfish') {
			return msg.channel.send(
				`${msg.author.minionName} needs ${requiredPoints}% Piscarilius Favour to fish Anglerfish!`
			);
		}

		if (
			fish.name === 'Barbarian fishing' &&
			(msg.author.skillLevel(SkillsEnum.Agility) < 15 || msg.author.skillLevel(SkillsEnum.Strength) < 15)
		) {
			return msg.channel.send('You need at least 15 Agility and Strength to do Barbarian Fishing.');
		}

		if (fish.name === 'Infernal eel' && msg.author.getKC(TzTokJad.id) < 1) {
			return msg.channel.send(
				'You are not worthy JalYt. Before you can fish Infernal Eels, you need to have defeated the mighty TzTok-Jad!'
			);
		}
		const anglerOutfit = Object.keys(Fishing.anglerItems).map(i => itemNameFromID(parseInt(i)));
		if (fish.name === 'Minnow' && anglerOutfit.some(test => !msg.author.hasItemEquippedOrInBank(test!))) {
			return msg.channel.send('You need to own the Angler Outfit to fish for Minnows.');
		}

		// If no quantity provided, set it to the max.
		let scaledTimePerFish =
			Time.Second * fish.timePerFish * (1 + (100 - msg.author.skillLevel(SkillsEnum.Fishing)) / 100);

		const boosts = [];
		switch (fish.bait) {
			case itemID('Fishing bait'):
				if (fish.name === 'Infernal eel') {
					scaledTimePerFish *= 1;
				} else if (
					msg.author.hasItemEquippedAnywhere(itemID('Pearl fishing rod')) &&
					fish.name !== 'Infernal eel'
				) {
					scaledTimePerFish *= 0.95;
					boosts.push('5% for Pearl fishing rod');
				}
				break;
			case itemID('Feather'):
				if (
					fish.name === 'Barbarian fishing' &&
					msg.author.hasItemEquippedAnywhere(itemID('Pearl barbarian rod'))
				) {
					scaledTimePerFish *= 0.95;
					boosts.push('5% for Pearl barbarian rod');
				} else if (
					msg.author.hasItemEquippedAnywhere(itemID('Pearl fly fishing rod')) &&
					fish.name !== 'Barbarian fishing'
				) {
					scaledTimePerFish *= 0.95;
					boosts.push('5% for Pearl fly fishing rod');
				}
				break;
			default:
				if (msg.author.hasItemEquippedAnywhere(itemID('Crystal harpoon'))) {
					scaledTimePerFish *= 0.95;
					boosts.push('5% for Crystal harpoon');
				}
				break;
		}

		if (fish.id === itemID('Minnow')) {
			scaledTimePerFish *= Math.max(
				0.83,
				-0.000_541_351 * msg.author.skillLevel(SkillsEnum.Fishing) ** 2 +
					0.089_066_3 * msg.author.skillLevel(SkillsEnum.Fishing) -
					2.681_53
			);
		}

		const maxTripLength = msg.author.maxTripLength('Fishing');

		if (quantity === null) {
			quantity = Math.floor(maxTripLength / scaledTimePerFish);
		}

		let duration = quantity * scaledTimePerFish;

		if (duration > maxTripLength) {
			return msg.channel.send(
				`${msg.author.minionName} can't go on trips longer than ${formatDuration(
					maxTripLength
				)}, try a lower quantity. The highest amount of ${fish.name} you can fish is ${Math.floor(
					maxTripLength / scaledTimePerFish
				)}.`
			);
		}

		if (fish.bait) {
			const hasBait = await msg.author.hasItem(fish.bait, quantity);
			if (!hasBait) {
				return msg.channel.send(`You need ${itemNameFromID(fish.bait)} to fish ${fish.name}!`);
			}
		}

		const tenPercent = Math.floor(calcPercentOfNum(10, duration));
		duration += rand(-tenPercent, tenPercent);

		// Remove the bait from their bank.
		if (fish.bait) {
			await msg.author.removeItemsFromBank(new Bank().add(fish.bait, quantity));
		}

		await addSubTaskToActivityTask<FishingActivityTaskOptions>({
			fishID: fish.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: 'Fishing'
		});

		let response = `${msg.author.minionName} is now fishing ${quantity}x ${
			fish.name
		}, it'll take around ${formatDuration(duration)} to finish.`;

		if (boosts.length > 0) {
			response += `\n\n**Boosts:** ${boosts.join(', ')}.`;
		}

		return msg.channel.send(response);
	}
}
