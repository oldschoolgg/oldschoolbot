import { Time } from 'e';
import { Bank } from 'oldschooljs';
import { SkillsEnum } from 'oldschooljs/dist/constants';

import removeFoodFromUser from '../../../lib/minions/functions/removeFoodFromUser';
import type { ActivityTaskOptionsWithNoChanges } from '../../../lib/types/minions';
import { formatDuration, randomVariation } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';

export async function mageArenaCommand(user: MUser, channelID: string) {
	if (user.skillLevel(SkillsEnum.Magic) < 60) {
		return 'You need level 60 Magic to do the Mage Arena.';
	}
	const duration = randomVariation(Time.Minute * 10, 5);

	const itemsNeeded = new Bank({
		'Blood rune': 100,
		'Air rune': 500,
		'Fire rune': 500,
		'Prayer potion(4)': 2
	});

	if (!user.owns(itemsNeeded)) {
		return `You don't own the needed items to do the Mage Arena, you need: ${itemsNeeded}.`;
	}

	const { foodRemoved } = await removeFoodFromUser({
		user,
		totalHealingNeeded: 20 * 23,
		healPerAction: 20 * 23,
		activityName: 'Mage Arena',
		attackStylesUsed: ['mage']
	});

	const totalCost = itemsNeeded.clone().add(foodRemoved);

	await user.removeItemsFromBank(itemsNeeded);

	updateBankSetting('mage_arena_cost', totalCost);

	await addSubTaskToActivityTask<ActivityTaskOptionsWithNoChanges>({
		userID: user.id,
		channelID: channelID.toString(),
		duration,
		type: 'MageArena'
	});

	return `${user.minionName} is now doing the Mage Arena, it will take approximately ${formatDuration(
		duration
	)}. Removed ${totalCost} from your bank.`;
}
