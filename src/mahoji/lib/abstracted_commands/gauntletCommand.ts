import { toTitleCase } from '@oldschoolgg/toolkit/util';
import { Time, calcWhatPercent, reduceNumByPercent } from 'e';

import { BitField } from '../../../lib/constants';
import { getMinigameScore } from '../../../lib/settings/minigames';
import { SkillsEnum } from '../../../lib/skilling/types';
import type { GauntletOptions } from '../../../lib/types/minions';
import { formatDuration, formatSkillRequirements, randomVariation } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';

const baseRequirements = {
	cooking: 70,
	farming: 70,
	fishing: 70,
	mining: 70,
	woodcutting: 70,
	agility: 70,
	smithing: 70,
	herblore: 70,
	construction: 70,
	hunter: 70,
	prayer: 77
};

const standardRequirements = {
	...baseRequirements,
	attack: 80,
	strength: 80,
	defence: 80,
	magic: 80,
	ranged: 80
};

const corruptedRequirements = {
	...baseRequirements,
	attack: 90,
	strength: 90,
	defence: 90,
	magic: 90,
	ranged: 90
};

export async function gauntletCommand(user: MUser, channelID: string, type: 'corrupted' | 'normal' = 'normal') {
	if (user.minionIsBusy) return `${user.minionName} is busy.`;
	if (user.QP < 200) {
		return 'You need at least 200 QP to do the Gauntlet.';
	}
	const readableName = `${toTitleCase(type)} Gauntlet`;
	const requiredSkills = type === 'corrupted' ? corruptedRequirements : standardRequirements;
	const prayLevel = user.skillLevel(SkillsEnum.Prayer);

	if (!user.hasSkillReqs(requiredSkills)) {
		return `You don't have the required stats to do the ${readableName}, you need: ${formatSkillRequirements(
			requiredSkills
		)}.`;
	}

	const [corruptedKC, normalKC] = await Promise.all([
		getMinigameScore(user.id, 'corrupted_gauntlet'),
		getMinigameScore(user.id, 'gauntlet')
	]);

	if (type === 'corrupted' && normalKC < 50) {
		return "You can't attempt the Corrupted Gauntlet, you have less than 50 normal Gauntlets completed - you would not stand a chance in the Corrupted Gauntlet!";
	}

	// Base times for gauntlet prep.
	const normPrep = Time.Minute * 8;
	const corrPrep = Time.Minute * 7.5;

	// Base times for Hunllef fight.
	const normHunllef = Time.Minute * 3.5;
	const corrHunllef = Time.Minute * 5.5;

	let baseLength = type === 'corrupted' ? corrPrep + corrHunllef : normPrep + normHunllef;

	const boosts = [];

	// Gauntlet prep boost
	let prepBoost = Math.min(100, calcWhatPercent(corruptedKC + normalKC, 100)) / 5;
	if (prepBoost > 1) {
		if (type === 'corrupted') {
			baseLength = reduceNumByPercent(baseLength, prepBoost);
			boosts.push(`${prepBoost}% boost for experience with preparation`);
		} else {
			prepBoost *= 2;
			baseLength = reduceNumByPercent(baseLength, prepBoost);
			boosts.push(`${prepBoost}% boost for experience with preparation (2x for normal prep)`);
		}
	}

	// Hunllef boss fight boost
	const scoreBoost =
		Math.min(100, calcWhatPercent(type === 'corrupted' ? corruptedKC : normalKC + corruptedKC, 100)) / 5;
	if (scoreBoost > 1) {
		baseLength = reduceNumByPercent(baseLength, scoreBoost);
		boosts.push(`${scoreBoost}% boost for ${type === 'corrupted' ? 'Corrupted ' : ''}Hunllef KC`);
	}

	if (user.bitfield.includes(BitField.HasArcaneScroll)) {
		boosts.push('5% for Augury');
		baseLength = reduceNumByPercent(baseLength, 5);
	} else if (prayLevel >= 45) {
		boosts.push('2% for Mystic Might');
		baseLength = reduceNumByPercent(baseLength, 2);
	}

	if (user.bitfield.includes(BitField.HasDexScroll)) {
		boosts.push('5% for Rigour');
		baseLength = reduceNumByPercent(baseLength, 5);
	} else if (prayLevel >= 44) {
		boosts.push('2% for Eagle Eye');
		baseLength = reduceNumByPercent(baseLength, 2);
	}

	// Add a 5% variance to account for randomness of gauntlet
	const gauntletLength = randomVariation(baseLength, 5);

	const maxTripLength = calcMaxTripLength(user, 'Gauntlet');

	const quantity = Math.floor(maxTripLength / gauntletLength);
	const duration = quantity * gauntletLength;

	if (duration > maxTripLength) {
		return `${user.minionName} can't go on trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest amount of ${readableName} you can do is ${Math.floor(
			maxTripLength / gauntletLength
		)}.`;
	}

	await addSubTaskToActivityTask<GauntletOptions>({
		userID: user.id,
		channelID: channelID.toString(),
		quantity,
		duration,
		type: 'Gauntlet',
		corrupted: type === 'corrupted'
	});

	const boostsStr = boosts.length > 0 ? `**Boosts:** ${boosts.join(', ')}` : '';

	return `${user.minionName} is now doing ${quantity}x ${readableName}. The trip will take ${formatDuration(duration)}.
${boostsStr}
`;
}
