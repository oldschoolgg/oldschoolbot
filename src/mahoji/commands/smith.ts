import { calcPercentOfNum, Time } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';

import { BlacksmithOutfit } from '../../lib/bsoOpenables';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Smithing from '../../lib/skilling/skills/smithing';
import smithables from '../../lib/skilling/skills/smithing/smithables';
import { SkillsEnum } from '../../lib/skilling/types';
import { SmithingActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, stringMatches, updateBankSetting } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../lib/util/calcMaxTripLength';
import { hasItemsEquippedOrInBank } from '../../lib/util/minionUtils';
import resolveItems from '../../lib/util/resolveItems';
import { OSBMahojiCommand } from '../lib/util';

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
		const user = await globalClient.fetchUser(userID);

		const smithedItem = Smithing.SmithableItems.find(_smithedItem =>
			stringMatches(_smithedItem.name, options.name)
		);

		if (!smithedItem) return 'That is not a valid item to smith.';
		if (smithedItem.requiresBlacksmith) {
			if (!hasItemsEquippedOrInBank(user, BlacksmithOutfit, 'every')) {
				return 'You need the Blacksmith outfit equipped or in your bank to smith this item.';
			}
		}

		if (user.skillLevel(SkillsEnum.Smithing) < smithedItem.level) {
			return `${user.minionName} needs ${smithedItem.level} Smithing to smith ${smithedItem.name}s.`;
		}

		const userQP = user.settings.get(UserSettings.QP);

		if (smithedItem.qpRequired && userQP < smithedItem.qpRequired) {
			return `${user.minionName} needs ${smithedItem.qpRequired} QP to smith ${smithedItem.name}`;
		}

		// Time to smith an item, add on quarter of a second to account for banking/etc.
		let timeToSmithSingleBar = smithedItem.timeToUse + Time.Second / 4;
		if (user.usingPet('Takon')) {
			timeToSmithSingleBar /= 4;
		} else if (user.hasItemEquippedAnywhere('Dwarven greathammer')) {
			timeToSmithSingleBar /= 2;
		}

		let maxTripLength = calcMaxTripLength(user, 'Smithing');
		if (smithedItem.name === 'Cannonball') {
			maxTripLength *= 2;
		}

		let { quantity } = options;
		// If no quantity provided, set it to the max.
		if (!quantity) {
			quantity = Math.floor(maxTripLength / timeToSmithSingleBar);
			if (smithedItem.name.includes('Dwarven') || smithedItem.name.includes('Gorajan')) {
				quantity = 1;
			}
		}

		await user.settings.sync(true);
		const baseCost = new Bank(smithedItem.inputBars);

		const maxCanDo = user.bank().fits(baseCost);
		if (maxCanDo === 0) {
			return "You don't have enough supplies to smith even one of this item!";
		}
		if (maxCanDo < quantity) {
			quantity = maxCanDo;
		}

		const cost = new Bank();
		cost.add(baseCost.multiply(quantity));

		const hasScroll = user.owns('Scroll of efficiency');
		if (hasScroll) {
			const itemsThatCanBeSaved = resolveItems([
				'Bronze bar',
				'Iron bar',
				'Steel bar',
				'Gold bar',
				'Silver bar',
				'Mithril bar',
				'Adamantite bar',
				'Runite bar',
				'Dwarven bar'
			]);
			for (const [item, qty] of baseCost.items()) {
				if (itemsThatCanBeSaved.includes(item.id)) {
					const saved = Math.floor(calcPercentOfNum(15, qty));
					cost.remove(item.id, saved);
				}
			}
		}

		const duration = quantity * timeToSmithSingleBar;
		if (duration > maxTripLength) {
			return `${user.minionName} can't go on trips longer than ${formatDuration(
				maxTripLength
			)}, try a lower quantity. The highest amount of ${smithedItem.name}${
				smithedItem.name.charAt(smithedItem.name.length - 1).toLowerCase() === 's' ? '' : 's'
			} you can smith is ${Math.floor(maxTripLength / timeToSmithSingleBar)}.`;
		}

		await transactItems({ userID: user.id, itemsToRemove: cost });
		updateBankSetting(globalClient, ClientSettings.EconomyStats.SmithingCost, cost);

		await addSubTaskToActivityTask<SmithingActivityTaskOptions>({
			smithedBarID: smithedItem.id,
			userID: user.id,
			channelID: channelID.toString(),
			quantity,
			duration,
			type: 'Smithing',
			cantBeDoubled: smithedItem.cantBeDoubled
		});
		let str = `${user.minionName} is now smithing ${quantity * smithedItem.outputMultiple}x ${
			smithedItem.name
		}, removed ${cost} from your bank, it'll take around ${formatDuration(duration)} to finish.`;

		if (user.usingPet('Takon')) {
			str += ' Takon is Smithing for you, at incredible speeds and skill.';
		} else if (user.hasItemEquippedAnywhere('Dwarven greathammer')) {
			str += ' 2x faster for Dwarven greathammer.';
		}
		if (hasScroll) {
			str += ' Your Scroll of efficiency enables you to save 15% of the bars used.';
		}
		return str;
	}
};
