import { calcWhatPercent, reduceNumByPercent, Time } from 'e';
import { KlasaUser } from 'klasa';

import { BitField } from '../../../lib/constants';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { GauntletOptions } from '../../../lib/types/minions';
import { formatDuration, formatSkillRequirements, skillsMeetRequirements, toTitleCase } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';

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
	hunter: 70
};

const standardRequirements = {
	...baseRequirements,
	attack: 80,
	strength: 80,
	defence: 80,
	magic: 80,
	ranged: 80,
	prayer: 77
};

const corruptedRequirements = {
	...baseRequirements,
	attack: 90,
	strength: 90,
	defence: 90,
	magic: 90,
	ranged: 90,
	prayer: 77,
	// Skilling
	cooking: 70,
	farming: 70,
	fishing: 70,
	mining: 70,
	woodcutting: 70
};

export async function gauntletCommand(user: KlasaUser, channelID: bigint, type: 'corrupted' | 'normal' = 'normal') {
	if (user.minionIsBusy) return `${user.minionName} is busy.`;
	if (user.settings.get(UserSettings.QP) < 200) {
		return 'You need atleast 200 QP to do the Gauntlet.';
	}
	const readableName = `${toTitleCase(type)} Gauntlet`;
	const requiredSkills = type === 'corrupted' ? corruptedRequirements : standardRequirements;

	if (!skillsMeetRequirements(user.rawSkills, requiredSkills)) {
		return `You don't have the required stats to do the ${readableName}, you need: ${formatSkillRequirements(
			requiredSkills
		)}.`;
	}

	const [corruptedKC, normalKC] = await Promise.all([
		user.getMinigameScore('corrupted_gauntlet'),
		user.getMinigameScore('gauntlet')
	]);

	if (type === 'corrupted' && normalKC < 50) {
		return "You can't attempt the Corrupted Gauntlet, you have less than 50 normal Gauntlets completed - you would not stand a chance in the Corrupted Gauntlet!";
	}

	let baseLength = type === 'corrupted' ? Time.Minute * 10 : Time.Minute * 14;

	const boosts = [];

	const scoreBoost = Math.min(100, calcWhatPercent(type === 'corrupted' ? corruptedKC : normalKC, 100)) / 5;
	if (scoreBoost > 1) {
		baseLength = reduceNumByPercent(baseLength, scoreBoost);
		boosts.push(`${scoreBoost}% boost for experience in the minigame`);
	}

	if (user.bitfield.includes(BitField.HasArcaneScroll)) {
		boosts.push('3% for Augury');
		baseLength = reduceNumByPercent(baseLength, 3);
	}

	if (user.bitfield.includes(BitField.HasDexScroll)) {
		boosts.push('3% for Rigour');
		baseLength = reduceNumByPercent(baseLength, 3);
	}

	let gauntletLength = baseLength;
	if (type === 'corrupted') gauntletLength *= 1.3;

	const maxTripLength = user.maxTripLength('Gauntlet');

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

	return `${user.minionName} is now doing ${quantity}x ${readableName}. The trip will take ${formatDuration(
		duration
	)}.
${boostsStr}
`;
}
