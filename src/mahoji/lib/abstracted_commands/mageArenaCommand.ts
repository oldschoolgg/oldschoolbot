import { Time } from 'e';
import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { SkillsEnum } from 'oldschooljs/dist/constants';

import { client } from '../../..';
import removeFoodFromUser from '../../../lib/minions/functions/removeFoodFromUser';
import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import { ActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration, randomVariation, updateBankSetting } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';

export async function mageArenaCommand(user: KlasaUser, channelID: bigint) {
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
		client,
		user,
		totalHealingNeeded: 20 * 23,
		healPerAction: 20 * 23,
		activityName: 'Mage Arena',
		attackStylesUsed: ['mage']
	});

	const totalCost = itemsNeeded.clone().add(foodRemoved);

	await user.removeItemsFromBank(itemsNeeded);

	updateBankSetting(client, ClientSettings.EconomyStats.MageArenaCost, totalCost);

	await addSubTaskToActivityTask<ActivityTaskOptions>({
		userID: user.id,
		channelID: channelID.toString(),
		duration,
		type: 'MageArena'
	});

	return `${user.minionName} is now doing the Mage Arena, it will take approximately ${formatDuration(
		duration
	)}. Removed ${totalCost} from your bank.`;
}
