import { calcPercentOfNum, reduceNumByPercent, Time } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';
import TzTokJad from 'oldschooljs/dist/simulation/monsters/special/TzTokJad';

import { inventionBoosts, InventionID, inventionItemBoost } from '../../lib/invention/inventions';
import { Favours, gotFavour } from '../../lib/minions/data/kourendFavour';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Fishing from '../../lib/skilling/skills/fishing';
import { SkillsEnum } from '../../lib/skilling/types';
import { FishingActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, itemID, itemNameFromID, rand } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { stringMatches } from '../../lib/util/cleanString';
import { hasItemsEquippedOrInBank } from '../../lib/util/minionUtils';
import { OSBMahojiCommand } from '../lib/util';

export const fishCommand: OSBMahojiCommand = {
	name: 'fish',
	description: 'Send your minion to fish fish.',
	attributes: {
		requiresMinion: true,
		requiresMinionNotBusy: true,
		examples: ['/fish name:Shrimp']
	},
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'name',
			description: 'The thing you want to fish.',
			required: true,
			autocomplete: async (value: string) => {
				return Fishing.Fishes.filter(i =>
					!value ? true : i.name.toLowerCase().includes(value.toLowerCase())
				).map(i => ({
					name: i.name,
					value: i.name
				}));
			}
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'quantity',
			description: 'The quantity you want to fish (optional).',
			required: false,
			min_value: 1
		}
	],
	run: async ({ options, userID, channelID }: CommandRunOptions<{ name: string; quantity?: number }>) => {
		const user = await globalClient.fetchUser(userID);

		await user.settings.sync(true);
		const fish = Fishing.Fishes.find(
			fish =>
				stringMatches(fish.name, options.name) || fish.alias?.some(alias => stringMatches(alias, options.name))
		);
		if (!fish) return 'Thats not a valid fish to catch.';

		if (user.skillLevel(SkillsEnum.Fishing) < fish.level) {
			return `${user.minionName} needs ${fish.level} Fishing to fish ${fish.name}.`;
		}

		if (fish.qpRequired) {
			if (user.settings.get(UserSettings.QP) < fish.qpRequired) {
				return `You need ${fish.qpRequired} qp to catch those!`;
			}
		}
		const [hasFavour, requiredPoints] = gotFavour(user, Favours.Piscarilius, 100);
		if (!hasFavour && fish.name === 'Anglerfish') {
			return `${user.minionName} needs ${requiredPoints}% Piscarilius Favour to fish Anglerfish!`;
		}

		if (
			fish.name === 'Barbarian fishing' &&
			(user.skillLevel(SkillsEnum.Agility) < 15 || user.skillLevel(SkillsEnum.Strength) < 15)
		) {
			return 'You need at least 15 Agility and Strength to do Barbarian Fishing.';
		}

		if (fish.name === 'Infernal eel' && user.getKC(TzTokJad.id) < 1) {
			return 'You are not worthy JalYt. Before you can fish Infernal Eels, you need to have defeated the mighty TzTok-Jad!';
		}
		const anglerOutfit = Object.keys(Fishing.anglerItems).map(i => itemNameFromID(parseInt(i)));
		if (fish.name === 'Minnow' && anglerOutfit.some(test => !user.hasItemEquippedOrInBank(test!))) {
			return 'You need to own the Angler Outfit to fish for Minnows.';
		}

		// If no quantity provided, set it to the max.
		let scaledTimePerFish =
			Time.Second * fish.timePerFish * (1 + (100 - user.skillLevel(SkillsEnum.Fishing)) / 100);

		const boosts = [];
		const hasShelldon = user.usingPet('Shelldon');
		if (hasShelldon) {
			scaledTimePerFish /= 2;
			boosts.push('2x faster for Shelldon');
		}
		let maxTripLength = user.maxTripLength('Fishing');

		const res = await inventionItemBoost({
			userID: BigInt(user.id),
			inventionID: InventionID.MechaRod,
			duration: Math.min(maxTripLength, options.quantity ? options.quantity * scaledTimePerFish : maxTripLength)
		});
		if (res.success) {
			scaledTimePerFish = reduceNumByPercent(scaledTimePerFish, inventionBoosts.mechaRod.speedBoostPercent);
			boosts.push(`${inventionBoosts.mechaRod.speedBoostPercent}% faster for Mecha rod (${res.messages})`);
		}

		switch (fish.bait) {
			case itemID('Fishing bait'):
				if (fish.name === 'Infernal eel') {
					scaledTimePerFish *= 1;
				} else if (user.hasItemEquippedAnywhere(itemID('Pearl fishing rod')) && fish.name !== 'Infernal eel') {
					scaledTimePerFish *= 0.95;
					boosts.push('5% for Pearl fishing rod');
				}
				break;
			case itemID('Feather'):
				if (fish.name === 'Barbarian fishing' && user.hasItemEquippedAnywhere(itemID('Pearl barbarian rod'))) {
					scaledTimePerFish *= 0.95;
					boosts.push('5% for Pearl barbarian rod');
				} else if (
					user.hasItemEquippedAnywhere(itemID('Pearl fly fishing rod')) &&
					fish.name !== 'Barbarian fishing'
				) {
					scaledTimePerFish *= 0.95;
					boosts.push('5% for Pearl fly fishing rod');
				}
				break;
			default:
				if (user.hasItemEquippedAnywhere(itemID('Crystal harpoon'))) {
					scaledTimePerFish *= 0.95;
					boosts.push('5% for Crystal harpoon');
				}
				break;
		}

		if (fish.id === itemID('Minnow')) {
			scaledTimePerFish *= Math.max(
				0.83,
				-0.000_541_351 * user.skillLevel(SkillsEnum.Fishing) ** 2 +
					0.089_066_3 * user.skillLevel(SkillsEnum.Fishing) -
					2.681_53
			);
		}

		const tackleBoxes = [
			"Champion's tackle box",
			'Professional tackle box',
			'Standard tackle box',
			'Basic tackle box'
		];
		for (let i = 0; i < tackleBoxes.length; i++) {
			if (hasItemsEquippedOrInBank(user, [tackleBoxes[i]])) {
				let num = Time.Minute * (tackleBoxes.length - i);
				maxTripLength += num;
				boosts.push(`${formatDuration(num)} for ${tackleBoxes[i]}`);
				break;
			}
		}

		let { quantity } = options;
		if (!quantity) quantity = Math.floor(maxTripLength / scaledTimePerFish);

		if (fish.bait) {
			const baseCost = new Bank().add(fish.bait);

			const maxCanDo = user.bank().fits(baseCost);
			if (maxCanDo === 0) {
				return `You need ${itemNameFromID(fish.bait)} to fish ${fish.name}!`;
			}
			if (maxCanDo < quantity) {
				quantity = maxCanDo;
			}

			const cost = new Bank();
			cost.add(baseCost.multiply(quantity));

			// Remove the bait from their bank.
			await user.removeItemsFromBank(new Bank().add(fish.bait, quantity));
		}

		let duration = quantity * scaledTimePerFish;

		if (duration > maxTripLength) {
			return `${user.minionName} can't go on trips longer than ${formatDuration(
				maxTripLength
			)}, try a lower quantity. The highest amount of ${fish.name} you can fish is ${Math.floor(
				maxTripLength / scaledTimePerFish
			)}.`;
		}

		const tenPercent = Math.floor(calcPercentOfNum(10, duration));
		duration += rand(-tenPercent, tenPercent);

		await addSubTaskToActivityTask<FishingActivityTaskOptions>({
			fishID: fish.id,
			userID: user.id,
			channelID: channelID.toString(),
			quantity,
			duration,
			type: 'Fishing'
		});

		let response = `${user.minionName} is now fishing ${quantity}x ${fish.name}, it'll take around ${formatDuration(
			duration
		)} to finish.`;

		if (boosts.length > 0) {
			response += `\n\n**Boosts:** ${boosts.join(', ')}.`;
		}

		return response;
	}
};
