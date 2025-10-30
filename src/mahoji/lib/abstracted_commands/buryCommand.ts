import { formatDuration, stringMatches, Time } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import Prayer from '@/lib/skilling/skills/prayer.js';
import type { BuryingActivityTaskOptions } from '@/lib/types/minions.js';

export async function buryCommand(user: MUser, channelID: string, boneName: string, quantity?: number) {
	const speedMod = 1;

	const bone = Prayer.Bones.find(
		bone => stringMatches(bone.name, boneName) || stringMatches(bone.name.split(' ')[0], boneName)
	);

	if (!bone) {
		return "That's not a valid bone to bury.";
	}

	if (user.skillsAsLevels.prayer < bone.level) {
		return `${user.minionName} needs ${bone.level} Prayer to bury ${bone.name}.`;
	}

	const timeToBuryABone = speedMod * (Time.Second * 1.2 + Time.Second / 4);

	const maxTripLength = await user.calcMaxTripLength('Burying');

	if (!quantity) {
		const amountOfBonesOwned = user.bank.amount(bone.inputId);
		if (!amountOfBonesOwned) return `You have no ${bone.name}.`;
		quantity = Math.min(Math.floor(maxTripLength / timeToBuryABone), amountOfBonesOwned);
	}

	const cost = new Bank({ [bone.inputId]: quantity });

	if (!user.owns(cost)) {
		return `You dont have ${cost}.`;
	}

	const duration = quantity * timeToBuryABone;

	if (duration > maxTripLength) {
		return `${user.minionName} can't go on trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest amount of ${bone.name}s you can bury is ${Math.floor(
			maxTripLength / timeToBuryABone
		)}.`;
	}

	await user.transactItems({ itemsToRemove: cost });

	await ActivityManager.startTrip<BuryingActivityTaskOptions>({
		boneID: bone.inputId,
		userID: user.id,
		channelID,
		quantity,
		duration,
		type: 'Burying'
	});

	return `${user.minionName} is now burying ${cost}, it'll take around ${formatDuration(duration)} to finish.`;
}
