import { objectEntries } from 'e';
import { KlasaClient, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { itemID } from 'oldschooljs/dist/util';

import { Emoji } from '../../constants';
import { Eatables } from '../../data/eatables';
import { GearSetupTypes } from '../../gear/types';
import { ClientSettings } from '../../settings/types/ClientSettings';
import { UserSettings } from '../../settings/types/UserSettings';
import { ItemBank } from '../../types';
import { reduceNumByPercent, updateBankSetting } from '../../util';
import getUserFoodFromBank from './getUserFoodFromBank';

export default async function removeFoodFromUser({
	client,
	user,
	totalHealingNeeded,
	healPerAction,
	activityName,
	attackStylesUsed,
	learningPercentage,
	dryRun
}: {
	client: KlasaClient;
	user: KlasaUser;
	totalHealingNeeded: number;
	healPerAction: number;
	activityName: string;
	attackStylesUsed: GearSetupTypes[];
	learningPercentage?: number;
	dryRun?: boolean;
}): Promise<[string, ItemBank]> {
	await user.settings.sync(true);
	const userBank = user.settings.get(UserSettings.Bank);

	const rawGear = user.rawGear();
	const gearSetupsUsed = objectEntries(rawGear).filter(entry => attackStylesUsed.includes(entry[0]));
	const reductions = [];
	const elyUsed = gearSetupsUsed.some(entry => entry[1].shield?.item === itemID('Elysian spirit shield'));
	if (elyUsed) {
		totalHealingNeeded = reduceNumByPercent(totalHealingNeeded, 17.5);
		reductions.push(`17.5% for Ely ${Emoji.Ely}`);
	}

	if (learningPercentage && learningPercentage > 1) {
		totalHealingNeeded = reduceNumByPercent(totalHealingNeeded, learningPercentage);
		reductions.push(`${learningPercentage}% for experience`);
	}

	const foodToRemove = getUserFoodFromBank(userBank, totalHealingNeeded);
	if (!foodToRemove) {
		throw `You don't have enough food to do ${activityName}! You need enough food to heal at least ${totalHealingNeeded} HP (${healPerAction} per action). You can use these food items: ${Eatables.map(
			i => i.name
		).join(', ')}.`;
	} else {
		if (!dryRun) {
			await user.removeItemsFromBank(foodToRemove);
			await updateBankSetting(client, ClientSettings.EconomyStats.PVMCost, foodToRemove);
		}
		let reductionsStr = reductions.length > 0 ? ` **Base Food Reductions:** ${reductions.join(', ')}.` : '';
		return [`${new Bank(foodToRemove)} from ${user.username}${reductionsStr}`, foodToRemove];
	}
}
