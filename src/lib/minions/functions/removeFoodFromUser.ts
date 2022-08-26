import { objectEntries, reduceNumByPercent } from 'e';
import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { itemID } from 'oldschooljs/dist/util';

import { Emoji } from '../../constants';
import { Eatables } from '../../data/eatables';
import { GearSetupType } from '../../gear';
import { ClientSettings } from '../../settings/types/ClientSettings';
import { UserSettings } from '../../settings/types/UserSettings';
import { updateBankSetting } from '../../util';
import getUserFoodFromBank from './getUserFoodFromBank';

export default async function removeFoodFromUser({
	user,
	totalHealingNeeded,
	healPerAction,
	activityName,
	combatStylesUsed: attackStylesUsed,
	learningPercentage
}: {
	user: KlasaUser;
	totalHealingNeeded: number;
	healPerAction: number;
	activityName: string;
	combatStylesUsed: GearSetupType[];
	learningPercentage?: number;
}): Promise<{ foodRemoved: Bank; reductions: string[]; reductionRatio: number }> {
	await user.settings.sync(true);

	const originalTotalHealing = totalHealingNeeded;
	const rawGear = user.rawGear();
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
	const favoriteFood = user.settings.get(UserSettings.FavoriteFood);

	const foodToRemove = getUserFoodFromBank(user, totalHealingNeeded, favoriteFood);
	if (!foodToRemove) {
		throw `You don't have enough food to do ${activityName}! You need enough food to heal at least ${totalHealingNeeded} HP (${healPerAction} per action). You can use these food items: ${Eatables.map(
			i => i.name
		).join(', ')}.`;
	} else {
		await user.removeItemsFromBank(foodToRemove);

		updateBankSetting(globalClient, ClientSettings.EconomyStats.PVMCost, foodToRemove);

		return {
			foodRemoved: foodToRemove,
			reductions,
			reductionRatio: totalHealingNeeded / originalTotalHealing
		};
	}
}
