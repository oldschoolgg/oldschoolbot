import { spoiler } from '@discordjs/builders';
import { Time } from 'e';
import { KlasaUser } from 'klasa';

import { SkillsEnum } from '../../../lib/skilling/types';
import { PercentCounter } from '../../../lib/structures/PercentCounter';
import { ActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration, itemNameFromID } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { userHasItemsEquippedAnywhere } from '../../../lib/util/minionUtils';
import resolveItems from '../../../lib/util/resolveItems';

export interface MoktangTaskOptions extends ActivityTaskOptions {
	qty: number;
}

const requiredPickaxes = resolveItems(['Crystal pickaxe', 'Volcanic pickaxe', 'Dwarven pickaxe', 'Dragon pickaxe']);

export async function moktangCommand(user: KlasaUser, channelID: bigint) {
	const timeToKill = new PercentCounter(Time.Minute * 20, 'time');
	const quantity = Math.floor(user.maxTripLength('Moktang') / timeToKill.value);
	const duration = timeToKill.value * quantity;

	const miningLevel = user.skillLevel(SkillsEnum.Mining);
	if (miningLevel < 85) return 'You need 85 Mining to fight Moktang.';
	if (!userHasItemsEquippedAnywhere(user, requiredPickaxes, false)) {
		return `You need to have one of these pickaxes equipped to fight Moktang: ${requiredPickaxes
			.map(itemNameFromID)
			.join(', ')}.`;
	}
	const miningLevelBoost = miningLevel - 84;
	timeToKill.add(true, miningLevelBoost, 'Mining level');

	await addSubTaskToActivityTask<MoktangTaskOptions>({
		userID: user.id,
		channelID: channelID.toString(),
		qty: quantity,
		duration,
		type: 'Moktang'
	});

	return `${user.minionName} is now off to kill Moktang ${quantity}x times, their trip will take ${formatDuration(
		duration
	)}.
**Boosts:** ${timeToKill.messages.join(', ')} ${spoiler(timeToKill.missed.join(', '))}`;
}
