import { stringMatches } from '@oldschoolgg/toolkit';
import { clamp, Time } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';

import Herblore from '../../lib/skilling/skills/herblore/herblore';
import { SkillsEnum } from '../../lib/skilling/types';
import { HerbloreActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../lib/util/calcMaxTripLength';
import { updateBankSetting } from '../../lib/util/updateBankSetting';
import { OSBMahojiCommand } from '../lib/util';

export const mixCommand: OSBMahojiCommand = {
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
				return Herblore.Mixables.map(i => i.item.name)
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
			i => stringMatches(i.item.name, options.name) || i.aliases.some(alias => stringMatches(alias, options.name))
		);
		if (!mixableItem) return 'That is not a valid mixable item.';

		if (user.skillLevel(SkillsEnum.Herblore) < mixableItem.level) {
			return `${user.minionName} needs ${mixableItem.level} Herblore to make ${mixableItem.item.name}.`;
		}

		if (mixableItem.qpRequired && user.QP < mixableItem.qpRequired) {
			return `You need atleast **${mixableItem.qpRequired}** QP to make ${mixableItem.item.name}.`;
		}

		const requiredItems = new Bank(mixableItem.inputItems);
		const baseCost = new Bank(mixableItem.inputItems);
		const { zahur, wesley, quantity: optionQuantity } = options;
		const {
			tickRate,
			bankTimePerPotion,
			item: { name: itemName },
			wesley: mixableWesley,
			zahur: mixableZahur
		} = mixableItem;

		let timeToMixSingleItem = tickRate * Time.Second * 0.6 + bankTimePerPotion * Time.Second;
		let cost = 'is now';

		if ((zahur && mixableZahur) || (wesley && mixableWesley)) {
			timeToMixSingleItem = 0.000_001;
			requiredItems.add('Coins', wesley ? 50 : 200);
			cost = `decided to pay ${wesley ? 'Wesley 50' : 'Zahur 200'} gp for each item so they don't have to go`;
		}

		const maxTripLength = calcMaxTripLength(user, 'Herblore');
		let quantity = optionQuantity || Math.floor(maxTripLength / timeToMixSingleItem);
		const maxCanDo = user.bankWithGP.fits(baseCost);

		if (maxCanDo < quantity) quantity = maxCanDo;
		quantity = clamp(quantity, 1, maxCanDo);
		if (quantity * timeToMixSingleItem > maxTripLength)
			return `${user.minionName} can't go on trips longer than ${formatDuration(
				maxTripLength
			)}, try a lower quantity. The highest amount of ${itemName}s you can make is ${Math.floor(
				maxTripLength / timeToMixSingleItem
			)}.`;

		const finalCost = requiredItems.multiply(quantity);
		if (!user.owns(finalCost)) return `You don't own: ${finalCost}.`;

		await user.removeItemsFromBank(finalCost);
		updateBankSetting('herblore_cost_bank', finalCost);

		await addSubTaskToActivityTask<HerbloreActivityTaskOptions>({
			mixableID: mixableItem.item.id,
			userID: user.id,
			channelID: channelID.toString(),
			zahur: Boolean(zahur),
			quantity,
			duration: quantity * timeToMixSingleItem,
			type: 'Herblore'
		});

		return `${user.minionName} ${cost} making ${quantity}x ${
			mixableItem.outputMultiple ? 'batches of' : ''
		} ${itemName}, it'll take around ${formatDuration(quantity * timeToMixSingleItem)} to finish.`;
	}
};
