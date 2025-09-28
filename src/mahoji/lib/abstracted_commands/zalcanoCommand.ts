import { percentChance } from '@oldschoolgg/rng';
import { calcWhatPercent, reduceNumByPercent, Time } from '@oldschoolgg/toolkit';
import { formatDuration } from '@oldschoolgg/toolkit/util';
import { EMonster } from 'oldschooljs';

import removeFoodFromUser from '@/lib/minions/functions/removeFoodFromUser.js';
import { soteSkillRequirements } from '@/lib/skilling/functions/questRequirements.js';
import type { ZalcanoActivityTaskOptions } from '@/lib/types/minions.js';
import addSubTaskToActivityTask from '@/lib/util/addSubTaskToActivityTask.js';
import { calcMaxTripLength } from '@/lib/util/calcMaxTripLength.js';
import { hasSkillReqs } from '@/lib/util/smallUtils.js';
import { userHasGracefulEquipped } from '@/mahoji/mahojiSettings.js';

function calcPerformance(kcLearned: number, skillPercentage: number) {
	let basePerformance = 50;

	// Up to +25% performance for KC
	basePerformance += Math.floor(kcLearned / 4);

	// Up to +20% Performance for Skill Levels
	basePerformance += Math.floor(skillPercentage / 10);

	return Math.min(100, basePerformance);
}

export async function zalcanoCommand(user: MUser, channelID: string, quantity?: number) {
	const [hasReqs, reason] = hasSkillReqs(user, soteSkillRequirements);
	if (!hasReqs) {
		return `To fight Zalcano, you need: ${reason}.`;
	}
	if (user.QP < 150) {
		return 'To fight Zalcano, you need 150 QP.';
	}

	const kc = await user.getKC(EMonster.ZALCANO);
	const kcLearned = Math.min(100, calcWhatPercent(kc, 100));

	const boosts = [];
	let baseTime = Time.Minute * 6;
	baseTime = reduceNumByPercent(baseTime, kcLearned / 6);
	boosts.push(`${(kcLearned / 6).toFixed(2)}% boost for experience`);

	const skills = user.skillsAsLevels;
	const skillPercentage = skills.mining + skills.smithing;

	baseTime = reduceNumByPercent(baseTime, skillPercentage / 40);
	boosts.push(`${skillPercentage / 40}% boost for levels`);

	if (!userHasGracefulEquipped(user)) {
		baseTime *= 1.15;
		boosts.push('-15% time penalty for not having graceful equipped');
	}

	let healAmountNeeded = 7 * 12;
	if (kc > 100) healAmountNeeded = 1 * 12;
	else if (kc > 50) healAmountNeeded = 3 * 12;
	else if (kc > 20) healAmountNeeded = 5 * 12;

	const maxTripLength = calcMaxTripLength(user, 'Zalcano');
	if (!quantity) quantity = Math.floor(maxTripLength / baseTime);
	quantity = Math.max(1, quantity);
	const duration = quantity * baseTime;

	if (quantity > 1 && duration > maxTripLength) {
		return `${user.minionName} can't go on PvM trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest amount you can do for Zalcano is ${Math.floor(
			maxTripLength / baseTime
		)}.`;
	}

	const { foodRemoved } = await removeFoodFromUser({
		user,
		totalHealingNeeded: healAmountNeeded * quantity,
		healPerAction: Math.ceil(healAmountNeeded / quantity),
		activityName: 'Zalcano',
		attackStylesUsed: []
	});

	await addSubTaskToActivityTask<ZalcanoActivityTaskOptions>({
		userID: user.id,
		channelID: channelID.toString(),
		quantity,
		duration,
		type: 'Zalcano',
		performance: calcPerformance(kcLearned, skillPercentage),
		isMVP: percentChance(80)
	});

	return `${user.minionName} is now off to kill Zalcano ${quantity}x times, their trip will take ${formatDuration(
		duration
	)}. (${formatDuration(baseTime)} per kill). Removed ${foodRemoved}.\n\n**Boosts:** ${boosts.join(', ')}.`;
}
