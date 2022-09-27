import { Time } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';

import Smithing from '../../lib/skilling/skills/smithing';
import smithables from '../../lib/skilling/skills/smithing/smithables';
import { SkillsEnum } from '../../lib/skilling/types';
import { SmithingActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../lib/util/calcMaxTripLength';
import { OSBMahojiCommand } from '../lib/util';
import { updateBankSetting } from '../mahojiSettings';

export const smithCommand: OSBMahojiCommand = {
	name: 'smith',
	description: 'Smith things using the Smithing skill.',
	attributes: {
		requiresMinion: true,
		requiresMinionNotBusy: true,
		examples: ['/smith name:Bronze platebody']
	},
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'name',
			description: 'The thing you want to smith.',
			required: true,
			autocomplete: async (value: string) => {
				return smithables
					.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())))
					.map(i => ({
						name: i.name,
						value: i.name
					}));
			}
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'quantity',
			description: 'The quantity you want to smith (optional).',
			required: false,
			min_value: 1
		}
	],
	run: async ({ options, userID, channelID }: CommandRunOptions<{ name: string; quantity?: number }>) => {
		const user = await mUserFetch(userID);

		const smithedItem = Smithing.SmithableItems.find(_smithedItem =>
			stringMatches(_smithedItem.name, options.name)
		);

		if (!smithedItem) return 'That is not a valid item to smith.';

		if (user.skillLevel(SkillsEnum.Smithing) < smithedItem.level) {
			return `${user.minionName} needs ${smithedItem.level} Smithing to smith ${smithedItem.name}s.`;
		}

		const userQP = user.QP;

		if (smithedItem.qpRequired && userQP < smithedItem.qpRequired) {
			return `${user.minionName} needs ${smithedItem.qpRequired} QP to smith ${smithedItem.name}`;
		}
		// If they have the entire Smiths' Uniform, give 100% chance save 1 tick each item
		let setBonus = 0;
		if (
			user.gear.skilling.hasEquipped(
				Object.keys(Smithing.smithsUniformItems).map(i => parseInt(i)),
				true
			)
		) {
			setBonus += 100;
		} else {
			// For each Smiths' Uniform item, check if they have it, give % chance to save 1 tick each item
			for (const [itemID, bonus] of Object.entries(Smithing.smithsUniformItems)) {
				if (user.gear.skilling.hasEquipped([parseInt(itemID)], false)) {
					setBonus += bonus;
				}
			}
		}

		// Time to smith an item, add on quarter of a second to account for banking/etc.
		const timeToSmithSingleBar = smithedItem.timeToUse + Time.Second / 4 - (Time.Second * 0.6 * setBonus) / 100;

		let maxTripLength = calcMaxTripLength(user, 'Smithing');
		if (smithedItem.name === 'Cannonball') {
			maxTripLength *= 2;
		}

		let { quantity } = options;
		// If no quantity provided, set it to the max.
		if (!quantity) quantity = Math.floor(maxTripLength / timeToSmithSingleBar);

		const baseCost = new Bank(smithedItem.inputBars);

		const maxCanDo = user.bank.fits(baseCost);
		if (maxCanDo === 0) {
			return "You don't have enough supplies to smith even one of this item!";
		}
		if (maxCanDo < quantity) {
			quantity = maxCanDo;
		}

		const cost = new Bank();
		cost.add(baseCost.multiply(quantity));

		const duration = quantity * timeToSmithSingleBar;
		if (duration > maxTripLength) {
			return `${user.minionName} can't go on trips longer than ${formatDuration(
				maxTripLength
			)}, try a lower quantity. The highest amount of ${smithedItem.name}${
				smithedItem.name.charAt(smithedItem.name.length - 1).toLowerCase() === 's' ? '' : 's'
			} you can smith is ${Math.floor(maxTripLength / timeToSmithSingleBar)}.`;
		}

		await transactItems({ userID: user.id, itemsToRemove: cost });
		updateBankSetting('smithing_cost', cost);

		await addSubTaskToActivityTask<SmithingActivityTaskOptions>({
			smithedBarID: smithedItem.id,
			userID: user.id,
			channelID: channelID.toString(),
			quantity,
			duration,
			type: 'Smithing'
		});

		return `${user.minionName} is now smithing ${quantity * smithedItem.outputMultiple}x ${
			smithedItem.name
		}, removed ${cost} from your bank, it'll take around ${formatDuration(duration)} to finish. ${
			setBonus > 0
				? `${setBonus}% chance to save 1 tick while smithing each item for using Smiths' Uniform item/items.`
				: ''
		}`;
	}
};
