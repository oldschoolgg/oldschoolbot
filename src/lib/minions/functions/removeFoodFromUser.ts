import { BSOItem } from '@/lib/bso/BSOItem.js';
import { BSOEmoji } from '@/lib/bso/bsoEmoji.js';

import { Emoji, objectEntries, reduceNumByPercent, UserError } from '@oldschoolgg/toolkit';
import { type Bank, itemID } from 'oldschooljs';

import { Eatables } from '@/lib/data/eatables.js';
import type { GearSetupType } from '@/lib/gear/types.js';
import getUserFoodFromBank, { getRealHealAmount } from '@/lib/minions/functions/getUserFoodFromBank.js';
import type { GearBank } from '@/lib/structures/GearBank.js';

export function removeFoodFromUserRaw({
	totalHealingNeeded,
	attackStylesUsed,
	learningPercentage,
	isWilderness,
	unavailableBank,
	gearBank,
	favoriteFood,
	minimumHealAmount
}: {
	favoriteFood: number[];
	gearBank: GearBank;
	totalHealingNeeded: number;
	attackStylesUsed: GearSetupType[];
	learningPercentage?: number;
	isWilderness?: boolean;
	unavailableBank?: Bank;
	minimumHealAmount?: number;
}) {
	const originalTotalHealing = totalHealingNeeded;
	const gearSetupsUsed = objectEntries(gearBank.gear).filter(entry => attackStylesUsed.includes(entry[0]));
	const reductions = [];
	const elyUsed = gearSetupsUsed.some(entry => entry[1].shield?.item === itemID('Elysian spirit shield'));
	if (elyUsed) {
		totalHealingNeeded = reduceNumByPercent(totalHealingNeeded, 17.5);
		reductions.push(`-17.5% for Ely ${Emoji.Ely}`);
	}
	if (
		gearSetupsUsed.some(i => i[0] === 'melee') &&
		gearBank.gear.melee.hasEquipped(
			['Justiciar faceguard', 'Justiciar chestguard', 'Justiciar legguards'],
			true,
			true
		)
	) {
		totalHealingNeeded = reduceNumByPercent(totalHealingNeeded, 6.5);
		reductions.push('-6.5% for Justiciar');
	}

	if (gearBank.bank.has(BSOItem.VAMPIRE_CARD)) {
		totalHealingNeeded = reduceNumByPercent(totalHealingNeeded, 25);
		reductions.push(`${BSOEmoji.VampireCard} -25%`);
	}

	if (learningPercentage && learningPercentage > 1) {
		totalHealingNeeded = reduceNumByPercent(totalHealingNeeded, learningPercentage);
		reductions.push(`-${learningPercentage}% for experience`);
	}
	const foodToRemove = getUserFoodFromBank({
		gearBank,
		totalHealingNeeded,
		favoriteFood,
		minimumHealAmount,
		isWilderness,
		unavailableBank
	});
	if (!foodToRemove) {
		return null;
	} else {
		return {
			foodToRemove,
			reductions,
			reductionRatio: totalHealingNeeded / originalTotalHealing
		};
	}
}

export type RemoveFoodFromUserParams = {
	user: MUser;
	totalHealingNeeded: number;
	healPerAction: number;
	activityName: string;
	attackStylesUsed: GearSetupType[];
	learningPercentage?: number;
	isWilderness?: boolean;
	unavailableBank?: Bank;
	minimumHealAmount?: number;
};

export default async function removeFoodFromUser({
	user,
	totalHealingNeeded,
	healPerAction,
	activityName,
	attackStylesUsed,
	learningPercentage,
	isWilderness,
	unavailableBank,
	minimumHealAmount
}: RemoveFoodFromUserParams): Promise<{ foodRemoved: Bank; reductions: string[]; reductionRatio: number }> {
	const result = removeFoodFromUserRaw({
		gearBank: user.gearBank,
		totalHealingNeeded,
		attackStylesUsed,
		learningPercentage,
		isWilderness,
		unavailableBank,
		favoriteFood: user.user.favorite_food
	});
	if (!result) {
		throw new UserError(
			`You don't have enough food to do ${activityName}! You need enough food to heal at least ${totalHealingNeeded} HP (${healPerAction} per action). You can use these food items${
				minimumHealAmount ? ` (Each food item must heal atleast ${minimumHealAmount}HP)` : ''
			}: ${Eatables.filter(food => {
				if (!minimumHealAmount) return true;
				return getRealHealAmount(user.gearBank, food.healAmount) >= minimumHealAmount;
			})
				.map(i => i.name)
				.join(', ')}.`
		);
	} else {
		await user.transactItems({ itemsToRemove: result.foodToRemove });
		await ClientSettings.updateBankSetting('economyStats_PVMCost', result.foodToRemove);
		return {
			foodRemoved: result.foodToRemove,
			reductions: result.reductions,
			reductionRatio: result.reductionRatio
		};
	}
}
