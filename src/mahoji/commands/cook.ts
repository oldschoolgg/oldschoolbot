import type { CommandRunOptions } from '@oldschoolgg/toolkit/util';
import { ApplicationCommandOptionType } from 'discord.js';
import { Time } from 'e';
import { Bank } from 'oldschooljs';

import { KourendKebosDiary, userhasDiaryTier } from '../../lib/diaries';
import Cooking, { Cookables } from '../../lib/skilling/skills/cooking/cooking';
import LeapingFish from '../../lib/skilling/skills/cooking/leapingFish';
import type { CookingActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, itemID, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../lib/util/calcMaxTripLength';
import { cutLeapingFishCommand } from '../lib/abstracted_commands/cutLeapingFishCommand';
import type { OSBMahojiCommand } from '../lib/util';

export const cookCommand: OSBMahojiCommand = {
	name: 'cook',
	description: 'Cook things using the cooking skill.',
	attributes: {
		requiresMinion: true,
		requiresMinionNotBusy: true,
		examples: ['/cook name:Shrimp']
	},
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'name',
			description: 'The thing you want to cook.',
			required: true,
			autocomplete: async (value: string) => {
				return [...Cookables.map(i => i.name), ...LeapingFish.map(i => i.item.name)]
					.filter(name => (!value ? true : name.toLowerCase().includes(value.toLowerCase())))
					.map(i => ({
						name: i,
						value: i
					}));
			}
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'quantity',
			description: 'The quantity you want to cook (optional).',
			required: false,
			min_value: 1
		}
	],
	run: async ({ options, userID, channelID }: CommandRunOptions<{ name: string; quantity?: number }>) => {
		const user = await mUserFetch(userID);
		let { quantity, name } = options;

		const barbarianFish = LeapingFish.find(
			_leapingFish =>
				stringMatches(_leapingFish.item.name, name) ||
				stringMatches(_leapingFish.item.name.split(' ')[0], name) ||
				_leapingFish.aliases.some(alias => stringMatches(alias, name))
		);

		if (barbarianFish) {
			return cutLeapingFishCommand({ user, channelID, name, quantity });
		}

		const cookable = Cooking.Cookables.find(
			cookable =>
				stringMatches(cookable.name, options.name) ||
				cookable.alias?.some(alias => stringMatches(alias, options.name))
		);

		if (!cookable) {
			return `Thats not a valid item to cook. Valid cookables are ${Cooking.Cookables.map(
				cookable => cookable.name
			).join(', ')}.`;
		}

		if (user.skillLevel('cooking') < cookable.level) {
			return `${user.minionName} needs ${cookable.level} Cooking to cook ${cookable.name}s.`;
		}

		const hasRemy = user.usingPet('Remy');
		// These are just for notifying the user, they only take effect in the Activity.
		const boosts = [];
		const [hasEasyDiary] = await userhasDiaryTier(user, KourendKebosDiary.easy);
		const [hasEliteDiary] = await userhasDiaryTier(user, KourendKebosDiary.elite);
		if (hasEasyDiary) boosts.push('Using Hosidius Range');
		if (hasEasyDiary && hasEliteDiary) boosts.push('Kourend Elite Diary');
		const hasGaunts = user.hasEquipped('Cooking gauntlets');
		if (hasGaunts) boosts.push('Cooking gauntlets equipped');

		let timeToCookSingleCookable = Time.Second * 2.4 + Time.Second * 0.45;

		if (cookable.id === itemID('Jug of wine') || cookable.id === itemID('Wine of zamorak')) {
			timeToCookSingleCookable /= 1.6;
			if (hasRemy) timeToCookSingleCookable /= 1.5;
		} else {
			let cookingBoost = 1;
			const cookingBoostItems: string[] = [];
			if (user.hasEquippedOrInBank('Cooking master cape')) {
				cookingBoostItems.push('Cooking master cape');
				cookingBoost += 2.5;
			}
			if (user.hasEquippedOrInBank('Dwarven gauntlets')) {
				cookingBoostItems.push('Dwarven gauntlets');
				cookingBoost += 1.5;
			}
			if (hasRemy) {
				cookingBoostItems.push('Remy');
				cookingBoost += 1;
			}
			timeToCookSingleCookable /= cookingBoost;
			if (cookingBoost !== 1) {
				boosts.push(`+${(cookingBoost - 1) * 100}% for ${cookingBoostItems.join(', ')}.`);
			}
		}

		const userBank = user.bank;
		const inputCost = new Bank(cookable.inputCookables);

		const maxTripLength = calcMaxTripLength(user, 'Cooking');

		if (!quantity) {
			quantity = Math.floor(maxTripLength / timeToCookSingleCookable);
			const max = userBank.fits(inputCost);
			if (max < quantity && max !== 0) quantity = max;
		}

		const totalCost = inputCost.clone().multiply(quantity);

		if (!userBank.fits(totalCost)) {
			return `You don't have enough items. You need: ${inputCost}.`;
		}

		const duration = quantity * timeToCookSingleCookable;

		if (duration > maxTripLength) {
			return `${user.minionName} can't go on trips longer than ${formatDuration(
				maxTripLength
			)} minutes, try a lower quantity. The highest amount of ${cookable.name}s you can cook is ${Math.floor(
				maxTripLength / timeToCookSingleCookable
			)}.`;
		}

		await user.removeItemsFromBank(totalCost);

		await addSubTaskToActivityTask<CookingActivityTaskOptions>({
			cookableID: cookable.id,
			userID: user.id,
			channelID: channelID.toString(),
			quantity,
			duration,
			type: 'Cooking'
		});

		return `${user.minionName} is now cooking ${quantity}x ${cookable.name}, it'll take around ${formatDuration(
			duration
		)} to finish.${
			hasRemy
				? "\n<:remy:748491189925183638> Remy jumps on your minions' head to help them with their cooking!"
				: ''
		}${boosts.length > 0 ? `\n\nBoosts: ${boosts.join(', ')}` : ''}`;
	}
};
