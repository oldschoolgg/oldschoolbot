import { calcPercentOfNum, Time } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';

import { BlacksmithOutfit } from '../../lib/bsoOpenables';
import { KaramjaDiary, userhasDiaryTier } from '../../lib/diaries';
import Smithing from '../../lib/skilling/skills/smithing';
import smithables from '../../lib/skilling/skills/smithing/smithables';
import { SkillsEnum } from '../../lib/skilling/types';
import { SmithingActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../lib/util/calcMaxTripLength';
import resolveItems from '../../lib/util/resolveItems';
import { pluraliseItemName } from '../../lib/util/smallUtils';
import { updateBankSetting } from '../../lib/util/updateBankSetting';
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
		const user = await mUserFetch(userID);

		const smithedItem = Smithing.SmithableItems.find(_smithedItem =>
			stringMatches(_smithedItem.name, options.name)
		);

		if (!smithedItem) return 'That is not a valid item to smith.';
		if (smithedItem.requiresBlacksmith) {
			if (!user.hasEquippedOrInBank(BlacksmithOutfit, 'every')) {
				return 'You need the Blacksmith outfit equipped or in your bank to smith this item.';
			}
		}

		if (user.skillLevel(SkillsEnum.Smithing) < smithedItem.level) {
			return `${user.minionName} needs ${smithedItem.level} Smithing to smith ${pluraliseItemName(
				smithedItem.name
			)}.`;
		}

		const userQP = user.QP;

		if (smithedItem.qpRequired && userQP < smithedItem.qpRequired) {
			return `${user.minionName} needs ${smithedItem.qpRequired} QP to smith ${smithedItem.name}.`;
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

		let maxTripLength = calcMaxTripLength(user, 'Smithing');
		let { timeToUse } = smithedItem;
		let doubleCBall = false;
		let diaryCannonball = false;
		if (smithedItem.name === 'Cannonball') {
			if (user.bank.has('Double ammo mould')) {
				doubleCBall = true;
				timeToUse /= 2;
			}
			const [has] = await userhasDiaryTier(user, KaramjaDiary.elite);
			if (has) {
				diaryCannonball = true;
				timeToUse /= 1.23;
			}
		}

		// Time to smith an item, add on quarter of a second to account for banking/etc.
		let timeToSmithSingleBar = timeToUse + Time.Second / 4 - (Time.Second * 0.6 * setBonus) / 100;
		if (user.usingPet('Takon')) {
			timeToSmithSingleBar /= 4;
		} else if (user.hasEquippedOrInBank('Dwarven greathammer')) {
			timeToSmithSingleBar /= 2;
		}

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
		updateBankSetting('smithing_cost', cost);

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
		}, removed ${cost} from your bank, it'll take around ${formatDuration(duration)} to finish. ${
			setBonus > 0
				? `${setBonus}% chance to save 1 tick while smithing each item for using Smiths' Uniform item/items.`
				: ''
		}${doubleCBall ? 'Twice as fast Cannonball production using Double ammo mould.' : ''}${
			diaryCannonball
				? 'Faster Cannonball production using the Shilo village furnance due to completing the Elite Karamja Diary.'
				: ''
		}`;

		if (user.usingPet('Takon')) {
			str += ' Takon is Smithing for you, at incredible speeds and skill.';
		} else if (user.hasEquippedOrInBank('Dwarven greathammer')) {
			str += ' 2x faster for Dwarven greathammer.';
		}
		if (hasScroll) {
			str += ' Your Scroll of efficiency enables you to save 15% of the bars used.';
		}
		return str;
	}
};
