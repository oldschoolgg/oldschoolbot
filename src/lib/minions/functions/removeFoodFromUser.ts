import { objectEntries, reduceNumByPercent } from 'e';
import type { Bank } from 'oldschooljs';
import { itemID } from 'oldschooljs/dist/util';

import { UserError } from '@oldschoolgg/toolkit/structures';
import { Emoji } from '../../constants';
import { Eatables } from '../../data/eatables';
import type { GearSetupType } from '../../gear/types';
import type { GearBank } from '../../structures/GearBank';
import { updateBankSetting } from '../../util/updateBankSetting';
import getUserFoodFromBank from './getUserFoodFromBank';

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

export default async function removeFoodFromUser({
	user,
	totalHealingNeeded,
	healPerAction,
	activityName,
	attackStylesUsed,
	learningPercentage,
	isWilderness,
	unavailableBank
}: {
	user: MUser;
	totalHealingNeeded: number;
	healPerAction: number;
	activityName: string;
	attackStylesUsed: GearSetupType[];
	learningPercentage?: number;
	isWilderness?: boolean;
	unavailableBank?: Bank;
}): Promise<{ foodRemoved: Bank; reductions: string[]; reductionRatio: number }> {
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
			`You don't have enough food to do ${activityName}! You need enough food to heal at least ${totalHealingNeeded} HP (${healPerAction} per action). You can use these food items: ${Eatables.map(
				i => i.name
			).join(', ')}.`
		);
	} else {
		await transactItems({ userID: user.id, itemsToRemove: result.foodToRemove });
		await updateBankSetting('economyStats_PVMCost', result.foodToRemove);
		return {
			foodRemoved: result.foodToRemove,
			reductions: result.reductions,
			reductionRatio: result.reductionRatio
		};
	}
}
