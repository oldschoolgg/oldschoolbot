import { calcWhatPercent, percentChance, reduceNumByPercent, Time } from 'e';
import { KlasaUser } from 'klasa';
import { SkillsEnum } from 'oldschooljs/dist/constants';

import { ZALCANO_ID } from '../../../lib/constants';
import removeFoodFromUser from '../../../lib/minions/functions/removeFoodFromUser';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { Skills } from '../../../lib/types';
import { ZalcanoActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';

export const soteSkillRequirements: Skills = {
	mining: 70,
	smithing: 70,
	farming: 70,
	woodcutting: 70,
	agility: 70,
	herblore: 70,
	construction: 70,
	hunter: 70
};
function calcPerformance(kcLearned: number, skillPercentage: number) {
	let basePerformance = 50;

	// Up to +25% performance for KC
	basePerformance += Math.floor(kcLearned / 4);

	// Up to +20% Performance for Skill Levels
	basePerformance += Math.floor(skillPercentage / 10);

	return Math.min(100, basePerformance);
}

export async function zalcanoCommand(user: KlasaUser, channelID: bigint) {
	const [hasSkillReqs, reason] = user.hasSkillReqs(soteSkillRequirements);
	if (!hasSkillReqs) {
		return `To fight Zalcano, you need: ${reason}.`;
	}
	if (user.settings.get(UserSettings.QP) < 150) {
		return 'To fight Zalcano, you need 150 QP.';
	}

	const kc = user.getKC(ZALCANO_ID);
	const kcLearned = Math.min(100, calcWhatPercent(kc, 100));

	const boosts = [];
	let baseTime = Time.Minute * 6;
	baseTime = reduceNumByPercent(baseTime, kcLearned / 6);
	boosts.push(`${(kcLearned / 6).toFixed(2)}% boost for experience`);

	const skillPercentage = user.skillLevel(SkillsEnum.Mining) + user.skillLevel(SkillsEnum.Smithing);

	baseTime = reduceNumByPercent(baseTime, skillPercentage / 40);
	boosts.push(`${skillPercentage / 40}% boost for levels`);

	if (user.usingPet('Obis')) {
		baseTime /= 2;
		boosts.push('2x boost for Obis');
	}

	if (!user.hasGracefulEquipped()) {
		baseTime *= 1.15;
		boosts.push('-15% time penalty for not having graceful equipped');
	}

	let healAmountNeeded = 7 * 12;
	if (kc > 100) healAmountNeeded = 1 * 12;
	else if (kc > 50) healAmountNeeded = 3 * 12;
	else if (kc > 20) healAmountNeeded = 5 * 12;

	const quantity = Math.floor(calcMaxTripLength(user, 'Zalcano') / baseTime);
	const duration = quantity * baseTime;

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
