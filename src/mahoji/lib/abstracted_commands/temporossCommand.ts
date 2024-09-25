import { Time, calcWhatPercent, reduceNumByPercent } from 'e';

import { formatDuration } from '@oldschoolgg/toolkit/util';
import { getMinigameScore } from '../../../lib/settings/minigames';
import type { TemporossActivityTaskOptions } from '../../../lib/types/minions';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';

export async function temporossCommand(user: MUser, channelID: string, quantity: number | undefined) {
	const fLevel = user.skillLevel('fishing');
	if (fLevel < 35) {
		return 'You need 35 Fishing to have a chance at defeating Tempoross.';
	}

	const messages = [];

	let durationPerRoss = Time.Minute * 15;

	let rewardBoost = 0;

	// Up to a 10% boost for 99 Fishing
	const fBoost = (fLevel + 1) / 10;
	if (fBoost > 1) messages.push(`${fBoost.toFixed(2)}% boost for Fishing level`);
	durationPerRoss = reduceNumByPercent(durationPerRoss, fBoost);

	const kc = await getMinigameScore(user.id, 'tempoross');
	const kcLearned = Math.min(100, calcWhatPercent(kc, 100));

	if (kcLearned > 0) {
		const percentReduced = kcLearned / 10;
		messages.push(`${percentReduced.toFixed(2)}% boost for KC`);
		durationPerRoss = reduceNumByPercent(durationPerRoss, percentReduced);
	}

	if (user.gear.skilling.hasEquipped('Crystal harpoon') && fLevel >= 71) {
		messages.push('30% boost for Crystal harpoon');
		durationPerRoss = reduceNumByPercent(durationPerRoss, 30);
	} else if (user.gear.skilling.hasEquipped('Infernal harpoon') && fLevel >= 75) {
		messages.push('10% boost for Infernal harpoon');
		durationPerRoss = reduceNumByPercent(durationPerRoss, 10);
		messages.push('100% more item rewards for Infernal harpoon');
		rewardBoost = 100;
	} else if (user.gear.skilling.hasEquipped('Dragon harpoon') && fLevel >= 61) {
		messages.push('10% boost for Dragon harpoon');
		durationPerRoss = reduceNumByPercent(durationPerRoss, 10);
	}

	const maxTripLength = calcMaxTripLength(user, 'Tempoross');
	if (!quantity) {
		quantity = Math.floor(maxTripLength / durationPerRoss);
	}

	const duration = durationPerRoss * quantity;

	if (duration > maxTripLength) {
		return `${user.minionName} can't go on trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest amount of Tempoross that you can kill is ${Math.floor(
			maxTripLength / durationPerRoss
		)}.`;
	}

	await addSubTaskToActivityTask<TemporossActivityTaskOptions>({
		minigameID: 'tempoross',
		userID: user.id,
		channelID: channelID.toString(),
		quantity,
		duration,
		type: 'Tempoross',
		rewardBoost
	});

	return `${user.minionName} is now off to kill Tempoross ${quantity}x times, their trip will take ${formatDuration(
		duration
	)}. (${formatDuration(durationPerRoss)} per ross)\n\n${messages.join(', ')}.`;
}
