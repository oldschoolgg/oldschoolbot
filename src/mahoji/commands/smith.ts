import { BSOEmoji } from '@/lib/bso/bsoEmoji.js';

import { calcPercentOfNum, formatDuration, stringMatches, Time } from '@oldschoolgg/toolkit';
import { Bank, Items } from 'oldschooljs';

import { KaramjaDiary, userhasDiaryTier } from '@/lib/diaries.js';
import Smithing from '@/lib/skilling/skills/smithing/index.js';
import smithables from '@/lib/skilling/skills/smithing/smithables/index.js';
import type { SmithingActivityTaskOptions } from '@/lib/types/minions.js';
import { pluraliseItemName } from '@/lib/util/smallUtils.js';

export const smithCommand = defineCommand({
	name: 'smith',
	description: 'Smith things using the Smithing skill.',
	attributes: {
		requiresMinion: true,
		requiresMinionNotBusy: true,
		examples: ['/smith name:Bronze platebody']
	},
	options: [
		{
			type: 'String',
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
			type: 'Integer',
			name: 'quantity',
			description: 'The quantity you want to smith (optional).',
			required: false,
			min_value: 1
		}
	],
	run: async ({ options, user, channelID }) => {
		const smithedItem = Smithing.SmithableItems.find(_smithedItem =>
			stringMatches(_smithedItem.name, options.name)
		);

		if (!smithedItem) return 'That is not a valid item to smith.';

		if (user.skillsAsLevels.smithing < smithedItem.level) {
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
				Object.keys(Smithing.smithsUniformItems).map(i => Number.parseInt(i)),
				true
			)
		) {
			setBonus += 100;
		} else {
			// For each Smiths' Uniform item, check if they have it, give % chance to save 1 tick each item
			for (const [itemID, bonus] of Object.entries(Smithing.smithsUniformItems)) {
				if (user.gear.skilling.hasEquipped([Number.parseInt(itemID)], false)) {
					setBonus += bonus;
				}
			}
		}

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
		const boosts: string[] = [];
		if (user.usingPet('Takon')) {
			timeToSmithSingleBar /= 4;
			boosts.push('4x for Takon');
		} else if (user.hasEquippedOrInBank('Dwarven greathammer')) {
			timeToSmithSingleBar /= 2;
			boosts.push('2x for Dwarven greathammer');
		}

		if (user.hasCard('ghost')) {
			timeToSmithSingleBar /= 2;
			boosts.push(`${BSOEmoji.GhostCard} 2x`);
		}

		let maxTripLength = user.calcMaxTripLength('Smithing');

		if (smithedItem.name === 'Cannonball') {
			maxTripLength *= 2;
		}

		let { quantity } = options;
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
			const itemsThatCanBeSaved = Items.resolveItems([
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
			const savedItems = new Bank();
			for (const [item, qty] of baseCost.items()) {
				if (itemsThatCanBeSaved.includes(item.id)) {
					const saved = Math.floor(calcPercentOfNum(15, qty));
					cost.remove(item.id, saved);
					savedItems.add(item.id, saved);
				}
			}
			if (savedItems.length > 0) {
				boosts.push(`Scroll of efficiency saved you: ${savedItems}`);
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

		await user.transactItems({ itemsToRemove: cost });
		await ClientSettings.updateBankSetting('smithing_cost', cost);

		await ActivityManager.startTrip<SmithingActivityTaskOptions>({
			smithedBarID: smithedItem.id,
			userID: user.id,
			channelID,
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
		}\n${doubleCBall ? 'Twice as fast Cannonball production using Double ammo mould.' : ''}
		\n${
			diaryCannonball
				? 'Faster Cannonball production using the Shilo village furnance due to completing the Elite Karamja Diary.'
				: ''
		}`;

		if (boosts.length > 0) {
			str += `\n**Boosts:** ${boosts.join(', ')}`;
		}
		return str;
	}
});
