import { formatDuration, stringMatches, Time } from '@oldschoolgg/toolkit';
import { Bank, EItem, itemID } from 'oldschooljs';

import Cooking, { Cookables, KarambwanShopCookDropMethod } from '@/lib/skilling/skills/cooking/cooking.js';
import ForestryRations from '@/lib/skilling/skills/cooking/forestersRations.js';
import { LeapingFish } from '@/lib/skilling/skills/cooking/leapingFish.js';
import type { CookingActivityTaskOptions } from '@/lib/types/minions.js';
import { formatTripDuration } from '@/lib/util/minionUtils.js';
import { cutLeapingFishCommand } from '@/mahoji/lib/abstracted_commands/cutLeapingFishCommand.js';
import { forestersRationCommand } from '@/mahoji/lib/abstracted_commands/forestersRationCommand.js';

export const cookCommand = defineCommand({
	name: 'cook',
	description: 'Cook things using the cooking skill.',
	attributes: {
		requiresMinion: true,
		requiresMinionNotBusy: true,
		examples: ['/cook name:Shrimp']
	},
	options: [
		{
			type: 'String',
			name: 'name',
			description: 'The thing you want to cook.',
			required: true,
			autocomplete: async ({ value }: StringAutoComplete) => {
				return [
					...Cookables.map(i => i.name),
					KarambwanShopCookDropMethod.name,
					...LeapingFish.map(i => i.item.name),
					...ForestryRations.map(i => i.name)
				]
					.filter(name => (!value ? true : name.toLowerCase().includes(value.toLowerCase())))
					.map(i => ({
						name: i,
						value: i
					}));
			}
		},
		{
			type: 'Integer',
			name: 'quantity',
			description: 'The quantity you want to cook (optional).',
			required: false,
			min_value: 1
		}
	],
	run: async ({ options, user, channelId }) => {
		let { quantity, name } = options;

		const barbarianFish = LeapingFish.find(
			_leapingFish =>
				stringMatches(_leapingFish.item.name, name) ||
				stringMatches(_leapingFish.item.name.split(' ')[0], name) ||
				_leapingFish.aliases.some(alias => stringMatches(alias, name))
		);

		if (barbarianFish) {
			return cutLeapingFishCommand({ user, channelId, name, quantity });
		}

		const forestryFood = ForestryRations.find(
			foresterRation =>
				stringMatches(foresterRation.name, name) || stringMatches(foresterRation.name.split(' ')[0], name)
		);

		if (forestryFood) {
			return forestersRationCommand({ user, channelId, name, quantity });
		}

		const isKarambwanShopCookDrop =
			stringMatches(KarambwanShopCookDropMethod.name, name) ||
			KarambwanShopCookDropMethod.aliases.some(alias => stringMatches(alias, name));

		if (isKarambwanShopCookDrop) {
			if (user.skillLevel('cooking') < KarambwanShopCookDropMethod.level) {
				return `${user.minionName} needs ${KarambwanShopCookDropMethod.level} Cooking to do ${KarambwanShopCookDropMethod.name}.`;
			}

			const timeToCookSingleCookable = Time.Hour / KarambwanShopCookDropMethod.quantityPerHour;
			const maxTripLength = await user.calcMaxTripLength('Cooking');
			if (!quantity) {
				quantity = Math.floor(maxTripLength / timeToCookSingleCookable);
				quantity = Math.min(quantity, Math.floor(Number(user.GP) / KarambwanShopCookDropMethod.gpCost));
			}
			if (quantity < 1) {
				return `You need at least ${KarambwanShopCookDropMethod.gpCost.toLocaleString()} GP to buy Raw karambwan.`;
			}

			const duration = quantity * timeToCookSingleCookable;
			if (duration > maxTripLength) {
				return `${user.minionName} can't go on trips longer than ${formatDuration(
					maxTripLength
				)} minutes, try a lower quantity. The highest amount of karambwans you can cook and drop is ${Math.floor(
					maxTripLength / timeToCookSingleCookable
				)}.`;
			}

			const totalCost = new Bank().add('Coins', quantity * KarambwanShopCookDropMethod.gpCost);
			if (!user.owns(totalCost)) {
				return `You need ${totalCost} to buy ${quantity.toLocaleString()}x Raw karambwan.`;
			}

			await user.removeItemsFromBank(totalCost);
			await ClientSettings.updateBankSetting('buy_cost_bank', totalCost);

			await ActivityManager.startTrip<CookingActivityTaskOptions>({
				cookableID: EItem.COOKED_KARAMBWAN,
				userID: user.id,
				channelId,
				quantity,
				duration,
				type: 'Cooking',
				method: 'KarambwanShopCookDrop'
			});

			return `${user.minionName
				} is now buying, cooking and dropping ${quantity.toLocaleString()}x karambwans, it'll take around ${formatTripDuration(
					user,
					duration
				)} to finish. This cost ${totalCost}.`;
		}

		const cookable = Cooking.Cookables.find(
			item =>
				stringMatches(item.name, options.name) || item.alias?.some(alias => stringMatches(alias, options.name))
		);

		if (!cookable) {
			return `Thats not a valid item to cook. Valid cookables are ${[
				KarambwanShopCookDropMethod.name,
				...Cooking.Cookables.map(item => item.name)
			].join(', ')}.`;
		}

		if (user.skillLevel('cooking') < cookable.level) {
			return `${user.minionName} needs ${cookable.level} Cooking to cook ${cookable.name}s.`;
		}

		// These are just for notifying the user, they only take effect in the Activity.
		const boosts = [];
		const hasEasyDiary = user.hasDiary('kourend&kebos.easy');
		const hasEliteDiary = user.hasDiary('kourend&kebos.elite');
		if (hasEasyDiary) boosts.push('Using Hosidius Range');
		if (hasEasyDiary && hasEliteDiary) boosts.push('Kourend Elite Diary');
		const hasGaunts = user.hasEquipped('Cooking gauntlets');
		if (hasGaunts) boosts.push('Cooking gauntlets equipped');

		const skills = user.skillsAsLevels;
		let timeToCookSingleCookable = Time.Second * 2.4 + Time.Second * 0.45;

		if (cookable.id === itemID('Jug of wine') || cookable.id === itemID('Wine of zamorak')) {
			timeToCookSingleCookable /= 1.9;
		}

		// Enable 1 tick Karambwan half way to 99
		if (skills.cooking >= 92 && cookable.id === itemID('Cooked karambwan')) {
			timeToCookSingleCookable /= 3.8;
			boosts.push('1t karambwans cooking with 92+ cooking');
		}

		const userBank = user.bank;
		const inputCost = new Bank(cookable.inputCookables);

		const maxTripLength = await user.calcMaxTripLength('Cooking');

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

		await ActivityManager.startTrip<CookingActivityTaskOptions>({
			cookableID: cookable.id,
			userID: user.id,
			channelId,
			quantity,
			duration,
			type: 'Cooking'
		});

		return `${user.minionName} is now cooking ${quantity}x ${cookable.name}, it'll take around ${formatTripDuration(
			user,
			duration
		)} to finish.${boosts.length > 0 ? `\n\nBoosts: ${boosts.join(', ')}` : ''}`;
	}
});
