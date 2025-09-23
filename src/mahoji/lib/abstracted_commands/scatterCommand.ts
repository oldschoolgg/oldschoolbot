import { Time } from '@oldschoolgg/toolkit/datetime';
import { formatDuration, stringMatches } from '@oldschoolgg/toolkit/util';
import { Bank } from 'oldschooljs';

import Prayer from '@/lib/skilling/skills/prayer.js';
import { SkillsEnum } from '@/lib/skilling/types.js';
import type { ScatteringActivityTaskOptions } from '@/lib/types/minions.js';
import addSubTaskToActivityTask from '@/lib/util/addSubTaskToActivityTask.js';
import { calcMaxTripLength } from '@/lib/util/calcMaxTripLength.js';

export async function scatterCommand(user: MUser, channelID: string, ashName: string, quantity?: number) {
	const speedMod = 1;

	const ash = Prayer.Ashes.find(
		ash => stringMatches(ash.name, ashName) || stringMatches(ash.name.split(' ')[0], ashName)
	);

	if (!ash) {
		return "That's not a valid ash to scatter.";
	}

	if (user.skillLevel(SkillsEnum.Prayer) < ash.level) {
		return `${user.minionName} needs ${ash.level} Prayer to scatter ${ash.name}.`;
	}

	const timeToScatterAnAsh = speedMod * (Time.Second * 1.2 + Time.Second / 4);

	const maxTripLength = calcMaxTripLength(user, 'Scattering');

	if (!quantity) {
		const amountOfAshesOwned = user.bank.amount(ash.inputId);
		if (!amountOfAshesOwned) return `You have no ${ash.name}.`;
		quantity = Math.min(Math.floor(maxTripLength / timeToScatterAnAsh), amountOfAshesOwned);
	}

	const cost = new Bank({ [ash.inputId]: quantity });

	if (!user.owns(cost)) {
		return `You dont have ${cost}.`;
	}

	const duration = quantity * timeToScatterAnAsh;

	if (duration > maxTripLength) {
		return `${user.minionName} can't go on trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest amount of ${ash.name}s you can scatter is ${Math.floor(
			maxTripLength / timeToScatterAnAsh
		)}.`;
	}

	await user.transactItems({ itemsToRemove: cost });

	await addSubTaskToActivityTask<ScatteringActivityTaskOptions>({
		ashID: ash.inputId,
		userID: user.id,
		channelID: channelID.toString(),
		quantity,
		duration,
		type: 'Scattering'
	});

	return `${user.minionName} is now scattering ${cost}, it'll take around ${formatDuration(duration)} to finish.`;
}
