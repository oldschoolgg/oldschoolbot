import { type CommandRunOptions, formatDuration, stringMatches } from '@oldschoolgg/toolkit';
import { ApplicationCommandOptionType } from 'discord.js';
import { Time, reduceNumByPercent } from 'e';

import { FaladorDiary, userhasDiaryTier } from '../../lib/diaries';
import { InventionID, inventionBoosts, inventionItemBoost } from '../../lib/invention/inventions';
import { Craftables } from '../../lib/skilling/skills/crafting/craftables';
import Tanning from '../../lib/skilling/skills/crafting/craftables/tanning';
import { SkillsEnum } from '../../lib/skilling/types';
import type { CraftingActivityTaskOptions } from '../../lib/types/minions';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../lib/util/calcMaxTripLength';
import { updateBankSetting } from '../../lib/util/updateBankSetting';
import type { OSBMahojiCommand } from '../lib/util';

export const craftCommand: OSBMahojiCommand = {
	name: 'craft',
	description: 'Craft items with the Crafting skill.',
	attributes: {
		requiresMinion: true,
		requiresMinionNotBusy: true,
		examples: ['/craft name:Onyx necklace']
	},
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'name',
			description: 'The item you want to craft.',
			required: true,
			autocomplete: async (value: string) => {
				return Craftables.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase()))).map(
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
			description: 'The quantity you want to craft (optional).',
			required: false,
			min_value: 1
		}
	],
	run: async ({ options, userID, channelID }: CommandRunOptions<{ name: string; quantity?: number }>) => {
		const user = await mUserFetch(userID);

		let { quantity } = options;

		if (options.name.toLowerCase().includes('zenyte') && quantity === null) quantity = 1;

		const craftable = Craftables.find(
			item => stringMatches(item.name, options.name) || item.alias?.some(a => stringMatches(a, options.name))
		);

		if (!craftable) return 'That is not a valid craftable item.';
		let sets = 'x';
		if (craftable.outputMultiple) {
			sets = ' sets of';
		}

		const userQP = user.QP;
		const currentWoodcutLevel = user.skillLevel(SkillsEnum.Woodcutting);

		if (craftable.qpRequired && userQP < craftable.qpRequired) {
			return `${user.minionName} needs ${craftable.qpRequired} QP to craft ${craftable.name}.`;
		}

		if (craftable.wcLvl && currentWoodcutLevel < craftable.wcLvl) {
			return `${user.minionName} needs ${craftable.wcLvl} Woodcutting Level to craft ${craftable.name}.`;
		}

		if (user.skillLevel(SkillsEnum.Crafting) < craftable.level) {
			return `${user.minionName} needs ${craftable.level} Crafting to craft ${craftable.name}.`;
		}

		const maxTripLength = calcMaxTripLength(user, 'Crafting');
		const boosts: string[] = [];
		const userBank = user.bankWithGP;

		// Get the base time to craft the item then add on quarter of a second per item to account for banking/etc.
		let timeToCraftSingleItem = craftable.tickRate * Time.Second * 0.6 + Time.Second / 4;
		const [hasFallyHard] = await userhasDiaryTier(user, FaladorDiary.hard);
		if (craftable.bankChest && (hasFallyHard || user.skillLevel(SkillsEnum.Crafting) >= 99)) {
			timeToCraftSingleItem /= 3.25;
		}

		const maxCanDo = userBank.fits(craftable.inputItems);
		const isTannable = Tanning.includes(craftable);
		if (user.usingPet('Klik') && isTannable) {
			timeToCraftSingleItem /= 3;
			boosts.push('3x faster for Klik helping Tan');
		}
		if (!isTannable) {
			if (user.hasEquippedOrInBank('Dwarven greathammer')) {
				timeToCraftSingleItem /= 2;
				boosts.push('2x faster for Dwarven greathammer');
			}
			const boostedTimeToCraftSingleItem = reduceNumByPercent(
				timeToCraftSingleItem,
				inventionBoosts.masterHammerAndChisel.speedBoostPercent
			);
			const res = await inventionItemBoost({
				user,
				inventionID: InventionID.MasterHammerAndChisel,
				duration: Math.min(
					maxTripLength,
					Math.min(maxCanDo, options.quantity ?? Math.floor(maxTripLength / boostedTimeToCraftSingleItem)) *
						boostedTimeToCraftSingleItem
				)
			});
			if (res.success) {
				timeToCraftSingleItem = boostedTimeToCraftSingleItem;
				boosts.push(
					`${inventionBoosts.masterHammerAndChisel.speedBoostPercent}% faster for Master hammer and chisel (${res.messages})`
				);
			}
		}

		if (!quantity) {
			quantity = Math.floor(maxTripLength / timeToCraftSingleItem);
			if (maxCanDo < quantity && maxCanDo !== 0) quantity = maxCanDo;
		}

		const duration = quantity * timeToCraftSingleItem;
		if (duration > maxTripLength) {
			return `${user.minionName} can't go on trips longer than ${formatDuration(
				maxTripLength
			)}, try a lower quantity. The highest amount of ${craftable.name}s you can craft is ${Math.floor(
				maxTripLength / timeToCraftSingleItem
			)}.`;
		}

		const itemsNeeded = craftable.inputItems.clone().multiply(quantity);

		// Check the user has all the required items to craft.
		if (!userBank.has(itemsNeeded)) {
			return `You don't have enough items. For ${quantity}x ${craftable.name}, you're missing **${itemsNeeded
				.clone()
				.remove(userBank)}**.`;
		}

		await user.removeItemsFromBank(itemsNeeded);

		updateBankSetting('crafting_cost', itemsNeeded);

		await addSubTaskToActivityTask<CraftingActivityTaskOptions>({
			craftableID: craftable.id,
			userID: user.id,
			channelID: channelID.toString(),
			quantity,
			duration,
			type: 'Crafting',
			cantBeDoubled: craftable.cantBeDoubled
		});
		let str = `${user.minionName} is now crafting ${quantity}${sets} ${
			craftable.name
		}, it'll take around ${formatDuration(duration)} to finish. Removed ${itemsNeeded} from your bank.`;
		if (boosts.length > 0) {
			str += `**Boosts:** ${boosts.join(', ')}`;
		}

		return str;
	}
};
