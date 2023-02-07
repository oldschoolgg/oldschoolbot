import { Time } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';

import Herblore from '../../lib/skilling/skills/herblore/herblore';
import { SkillsEnum } from '../../lib/skilling/types';
import { HerbloreActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../lib/util/calcMaxTripLength';
import { stringMatches } from '../../lib/util/cleanString';
import { updateBankSetting } from '../../lib/util/updateBankSetting';
import { OSBMahojiCommand } from '../lib/util';

export const mineCommand: OSBMahojiCommand = {
	name: 'mix',
	description: 'Mix potions to train Herblore.',
	attributes: {
		requiresMinion: true,
		requiresMinionNotBusy: true,
		examples: ['/mix name:Prayer potion']
	},
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'name',
			description: 'The potion you want to mix.',
			required: true,
			autocomplete: async (value: string) => {
				return Herblore.Mixables.filter(i =>
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
			description: 'The quantity you want to mix (optional).',
			required: false,
			min_value: 1
		},
		{
			type: ApplicationCommandOptionType.Boolean,
			name: 'wesley',
			description: 'If available, pay Wesley to crush items. (optional).',
			required: false
		},
		{
			type: ApplicationCommandOptionType.Boolean,
			name: 'zahur',
			description: 'If available, pay Zahur to clean herbs. (optional).',
			required: false
		}
	],
	run: async ({
		options,
		userID,
		channelID
	}: CommandRunOptions<{ name: string; quantity?: number; wesley?: boolean; zahur?: boolean }>) => {
		const user = await mUserFetch(userID);
		const mixableItem = Herblore.Mixables.find(
			item =>
				stringMatches(item.name, options.name) || item.aliases.some(alias => stringMatches(alias, options.name))
		);

		if (!mixableItem) return 'That is not a valid mixable item.';

		if (user.skillLevel(SkillsEnum.Herblore) < mixableItem.level) {
			return `${user.minionName} needs ${mixableItem.level} Herblore to make ${mixableItem.name}.`;
		}

		if (mixableItem.qpRequired && user.QP < mixableItem.qpRequired) {
			return `You need atleast **${mixableItem.qpRequired}** QP to make ${mixableItem.name}.`;
		}

		let sets = 'x';
		let cost = 'is now';
		if (mixableItem.outputMultiple) {
			sets = 'batches of';
		}

		let requiredItems = new Bank(mixableItem.inputItems);

		// Get the base time to mix the item then add on quarter of a second per item to account for banking/etc.
		let timeToMixSingleItem =
			mixableItem.tickRate * Time.Second * 0.6 + mixableItem.bankTimePerPotion * Time.Second;

		const { zahur } = options;
		if (zahur && mixableItem.zahur === true) {
			timeToMixSingleItem = 0.000_001;
			requiredItems.add('Coins', 200);
			cost = "decided to pay Zahur 200 gp for each potion so they don't have to go";
		}
		if (options.wesley && mixableItem.wesley === true) {
			timeToMixSingleItem = 0.000_001;
			requiredItems.add('Coins', 50);
			cost = "decided to pay Wesley 50 gp for each item so they don't have to go";
		}

		const maxTripLength = calcMaxTripLength(user, 'Herblore');

		let { quantity } = options;
		if (!quantity) quantity = Math.floor(maxTripLength / timeToMixSingleItem);

		const baseCost = new Bank(mixableItem.inputItems);

		const maxCanDo = user.bankWithGP.fits(baseCost);
		if (maxCanDo === 0) {
			return `You don't have enough supplies to mix even one of this item!\nTo mix/clean a ${mixableItem.name}, you need to have ${baseCost}.`;
		}
		if (maxCanDo < quantity) {
			quantity = maxCanDo;
		}

		const duration = quantity * timeToMixSingleItem;

		if (duration > maxTripLength) {
			return `${user.minionName} can't go on trips longer than ${formatDuration(
				maxTripLength
			)}, try a lower quantity. The highest amount of ${mixableItem.name}s you can make is ${Math.floor(
				maxTripLength / timeToMixSingleItem
			)}.`;
		}

		const finalCost = requiredItems.multiply(quantity);
		if (!user.owns(finalCost)) {
			return `You don't own: ${finalCost}.`;
		}
		await user.removeItemsFromBank(finalCost);

		updateBankSetting('herblore_cost_bank', finalCost);

		await addSubTaskToActivityTask<HerbloreActivityTaskOptions>({
			mixableID: mixableItem.id,
			userID: user.id,
			channelID: channelID.toString(),
			zahur: Boolean(options.zahur),
			quantity,
			duration,
			type: 'Herblore'
		});

		return `${user.minionName} ${cost} making ${quantity} ${sets} ${
			mixableItem.name
		}, it'll take around ${formatDuration(duration)} to finish.`;
	}
};
