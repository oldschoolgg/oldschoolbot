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

export async function mageArena2Command(user: KlasaUser, channelID: bigint) {
	if (user.skillLevel(SkillsEnum.Magic) < 75) {
		return 'You need level 75 Magic to do the Mage Arena II.';
	}
	if (user.cl().amount('Saradomin cape') === 0) {
		return 'You need to have completed Mage Arena I before doing part II.';
	}
	const duration = randomVariation(Time.Minute * 25, 3);

	const itemsNeeded = new Bank({
		'Saradomin brew(4)': 1,
		'Super restore(4)': 3,
		'Stamina potion(4)': 1,
		'Fire rune': 800,
		'Air rune': 500,
		'Blood rune': 300
	});

	if (!user.owns(itemsNeeded)) {
		return `You don't own the needed items to do the Mage Arena II, you need: ${itemsNeeded}.`;
	}

	const { foodRemoved } = await removeFoodFromUser({
		client,
		user,
		totalHealingNeeded: 20 * 23,
		healPerAction: 20 * 23,
		activityName: 'Mage Arena II',
		attackStylesUsed: ['mage']
	});

	await user.removeItemsFromBank(itemsNeeded);

	const totalCost = itemsNeeded.clone().add(foodRemoved);

	await updateBankSetting(client, ClientSettings.EconomyStats.MageArenaCost, totalCost);

	await addSubTaskToActivityTask<ActivityTaskOptions>({
		userID: user.id,
		channelID: channelID.toString(),
		duration,
		type: 'MageArena2'
	});

	return `${user.minionName} is now doing the Mage Arena II, it will take approximately ${formatDuration(
		duration
	)}. Removed ${totalCost} from your bank.`;
}
