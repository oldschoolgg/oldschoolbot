import { Time } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';

import Cooking, { Cookables } from '../../lib/skilling/skills/cooking';
import { SkillsEnum } from '../../lib/skilling/types';
import { CookingActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, itemID, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../lib/util/calcMaxTripLength';
import { OSBMahojiCommand } from '../lib/util';

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
				return Cookables.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase()))).map(
					i => ({
						name: i.name,
						value: i.name
					})
				);
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
		const user = await globalClient.fetchUser(userID);

		await user.settings.sync(true);
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

		if (user.skillLevel(SkillsEnum.Cooking) < cookable.level) {
			return `${user.minionName} needs ${cookable.level} Cooking to cook ${cookable.name}s.`;
		}

		// Based off catherby fish/hr rates
		let timeToCookSingleCookable = Time.Second * 2.88;
		if (cookable.id === itemID('Jug of wine') || cookable.id === itemID('Wine of zamorak')) {
			timeToCookSingleCookable /= 1.6;
		}

		const userBank = user.bank();
		const inputCost = new Bank(cookable.inputCookables);

		const maxTripLength = calcMaxTripLength(user, 'Cooking');

		let { quantity } = options;
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
		)} to finish.`;
	}
};
