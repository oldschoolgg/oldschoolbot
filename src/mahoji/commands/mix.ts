import { stringMatches } from '@oldschoolgg/toolkit/util';
import type { CommandRunOptions } from '@oldschoolgg/toolkit/util';
import { ApplicationCommandOptionType } from 'discord.js';
import { Time } from 'e';
import { Bank } from 'oldschooljs';

import { formatDuration } from '@oldschoolgg/toolkit/util';
import Herblore from '../../lib/skilling/skills/herblore/herblore';
import { SkillsEnum } from '../../lib/skilling/types';
import type { HerbloreActivityTaskOptions } from '../../lib/types/minions';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../lib/util/calcMaxTripLength';
import { updateBankSetting } from '../../lib/util/updateBankSetting';
import type { OSBMahojiCommand } from '../lib/util';

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
			return `You need at least **${mixableItem.qpRequired}** QP to make ${mixableItem.item.name}.`;
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

		const userBank = user.bankWithGP;

		let timeToMixSingleItem = tickRate * Time.Second * 0.6 + bankTimePerPotion * Time.Second;
		let cost = 'is now';

		if ((zahur && mixableZahur) || (wesley && mixableWesley)) {
			timeToMixSingleItem = 0.000_001;
			requiredItems.add('Coins', mixableWesley ? 50 : 200);
			cost = `decided to pay ${
				mixableWesley ? 'Wesley 50' : 'Zahur 200'
			} gp for each item so they don't have to go.`;
		}

		const maxTripLength = calcMaxTripLength(user, 'Herblore');
		let quantity = optionQuantity;
		const maxCanDo = user.bankWithGP.fits(baseCost);
		const maxCanMix = Math.floor(maxTripLength / timeToMixSingleItem);

		if (!user.owns(requiredItems)) {
			return `You don't have the required items for ${mixableItem.item.name}: ${requiredItems}.`;
		}

		if (!quantity) {
			quantity = maxCanMix;
			if (maxCanDo < quantity && maxCanDo !== 0) quantity = maxCanDo;
		}

		quantity = Math.max(1, quantity);

		if (quantity * timeToMixSingleItem > maxTripLength)
			return `${user.minionName} can't go on trips longer than ${formatDuration(
				maxTripLength
			)}, try a lower quantity. The highest amount of ${itemName} you can mix is ${maxCanMix}.`;

		const finalCost = requiredItems.clone().multiply(quantity);
		if (!user.owns(finalCost))
			return `You don't have enough items. For ${quantity}x ${itemName}, you're missing **${finalCost
				.clone()
				.remove(userBank)}**.`;

		await user.removeItemsFromBank(finalCost);

		updateBankSetting('herblore_cost_bank', finalCost);

		await addSubTaskToActivityTask<HerbloreActivityTaskOptions>({
			mixableID: mixableItem.item.id,
			userID: user.id,
			channelID: channelID.toString(),
			zahur: Boolean(zahur),
			wesley: Boolean(wesley),
			quantity,
			duration: quantity * timeToMixSingleItem,
			type: 'Herblore'
		});

		return `${user.minionName} ${cost} making ${quantity}x ${
			mixableItem.outputMultiple ? 'batches of' : ''
		}${itemName}, it'll take around ${formatDuration(quantity * timeToMixSingleItem)} to finish.`;
	}
};
