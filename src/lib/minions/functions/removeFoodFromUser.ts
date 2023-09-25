import { UserError } from '@oldschoolgg/toolkit/dist/lib/UserError';
import { objectEntries, reduceNumByPercent } from 'e';
import { Bank } from 'oldschooljs';
import { itemID } from 'oldschooljs/dist/util';

import { Emoji } from '../../constants';
import { Eatables } from '../../data/eatables';
import { GearSetupType } from '../../gear/types';
import { updateBankSetting } from '../../util/updateBankSetting';
import getUserFoodFromBank from './getUserFoodFromBank';

export default async function removeFoodFromUser({
	user,
	totalHealingNeeded,
	healPerAction,
	activityName,
	attackStylesUsed,
	learningPercentage,
	isWilderness
}: {
	user: MUser;
	totalHealingNeeded: number;
	healPerAction: number;
	activityName: string;
	attackStylesUsed: GearSetupType[];
	learningPercentage?: number;
	isWilderness?: boolean;
}): Promise<{ foodRemoved: Bank; reductions: string[]; reductionRatio: number }> {
	const originalTotalHealing = totalHealingNeeded;
	const rawGear = user.gear;
	const gearSetupsUsed = objectEntries(rawGear).filter(entry => attackStylesUsed.includes(entry[0]));
	const reductions = [];
	const elyUsed = gearSetupsUsed.some(entry => entry[1].shield?.item === itemID('Elysian spirit shield'));
	if (elyUsed) {
		totalHealingNeeded = reduceNumByPercent(totalHealingNeeded, 17.5);
		reductions.push(`-17.5% for Ely ${Emoji.Ely}`);
	}
	if (
		gearSetupsUsed.some(i => i[0] === 'melee') &&
		rawGear.melee.hasEquipped(['Justiciar faceguard', 'Justiciar chestguard', 'Justiciar legguards'], true, true)
	) {
		totalHealingNeeded = reduceNumByPercent(totalHealingNeeded, 6.5);
		reductions.push('-6.5% for Justiciar');
	}

	if (learningPercentage && learningPercentage > 1) {
		totalHealingNeeded = reduceNumByPercent(totalHealingNeeded, learningPercentage);
		reductions.push(`-${learningPercentage}% for experience`);
	}
	const favoriteFood = user.user.favorite_food;

	const foodToRemove = getUserFoodFromBank(user, totalHealingNeeded, favoriteFood, undefined, isWilderness);
	if (!foodToRemove) {
		throw new UserError(
			`You don't have enough food to do ${activityName}! You need enough food to heal at least ${totalHealingNeeded} HP (${healPerAction} per action). You can use these food items: ${Eatables.map(
				i => i.name
			).join(', ')}.`
		);
	} else {
		await transactItems({ userID: user.id, itemsToRemove: foodToRemove });

		updateBankSetting('economyStats_PVMCost', foodToRemove);

		return {
			foodRemoved: foodToRemove,
			reductions,
			reductionRatio: totalHealingNeeded / originalTotalHealing
		};
	}
}
