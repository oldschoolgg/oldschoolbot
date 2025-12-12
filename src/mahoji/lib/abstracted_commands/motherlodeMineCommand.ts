import { randomVariation } from '@oldschoolgg/rng';
import { increaseNumByPercent, reduceNumByPercent } from '@oldschoolgg/toolkit';
import { Items } from 'oldschooljs';

import { determineMiningTime } from '@/lib/skilling/functions/determineMiningTime.js';
import { pickaxes } from '@/lib/skilling/functions/miningBoosts.js';
import Mining from '@/lib/skilling/skills/mining.js';
import type { MotherlodeMiningActivityTaskOptions } from '@/lib/types/minions.js';
import { formatTripDuration } from '@/lib/util/minionUtils.js';
export async function motherlodeMineCommand({
	user,
	channelId,
	quantity
}: {
	user: MUser;
	channelId: string;
	quantity?: number;
}) {
	let miningLevel = user.skillsAsLevels.mining;
	if (miningLevel < 30) {
		return `${user.minionName} needs 30 Mining to mine at the Motherlode Mine.`;
	}

	const motherlode = Mining.MotherlodeMine;

	const boosts = [];
	// Checks if user own Celestial ring or Celestial signet
	if (user.hasEquippedOrInBank(['Celestial ring (uncharged)'])) {
		boosts.push('+4 invisible Mining lvls for Celestial ring');
		miningLevel += 4;
	}
	// Default bronze pickaxe, last in the array
	let currentPickaxe = pickaxes[pickaxes.length - 1];
	boosts.push(
		`**${currentPickaxe.ticksBetweenRolls}** ticks between rolls for ${Items.itemNameFromId(currentPickaxe.id)}`
	);

	// For each pickaxe, if they have it, give them its' bonus and break.
	for (const pickaxe of pickaxes) {
		if (!user.hasEquippedOrInBank([pickaxe.id]) || user.skillsAsLevels.mining < pickaxe.miningLvl) continue;
		currentPickaxe = pickaxe;
		boosts.pop();
		boosts.push(`**${pickaxe.ticksBetweenRolls}** ticks between rolls for ${Items.itemNameFromId(pickaxe.id)}`);
		break;
	}

	// Check for 100 golden nuggets and 72 mining for upper motherlode mine access.
	const gotNuggets = user.cl.amount('Golden nugget') >= 100;
	if (gotNuggets && miningLevel >= 72) {
		motherlode.respawnTime = 4;
		motherlode.bankingTime = 40;
		boosts.push(
			'\nYou are mining on the upper level of the motherlode mine, due to having 100 golden nuggets in your cl and 72 mining or higher'
		);
	}

	const glovesEffect = 0;
	const armourEffect = 0;
	const miningCapeEffect = 0;
	const goldSilverBoost = false;
	const powermine = false;

	// Calculate the time it takes to mine specific quantity or as many as possible
	const [duration, newQuantity] = determineMiningTime({
		quantity,
		gearBank: user.gearBank,
		ore: motherlode,
		ticksBetweenRolls: currentPickaxe.ticksBetweenRolls,
		glovesEffect,
		armourEffect,
		miningCapeEffect,
		powermining: powermine,
		goldSilverBoost,
		miningLvl: miningLevel,
		maxTripLength: await user.calcMaxTripLength('MotherlodeMining'),
		hasKaramjaMedium: false
	});

	const fakeDurationMin = quantity ? randomVariation(reduceNumByPercent(duration, 25), 20) : duration;
	const fakeDurationMax = quantity ? randomVariation(increaseNumByPercent(duration, 25), 20) : duration;

	await ActivityManager.startTrip<MotherlodeMiningActivityTaskOptions>({
		userID: user.id,
		channelId,
		quantity: newQuantity,
		iQty: quantity ? quantity : undefined,
		duration,
		fakeDurationMax: Math.floor(fakeDurationMax),
		fakeDurationMin: Math.floor(fakeDurationMin),
		type: 'MotherlodeMining'
	});
	let response = `${user.minionName} is now mining at the Motherlode Mine until your minion ${
		quantity ? `mined ${quantity}x pay-dirt or gets tired` : 'is satisfied'
	}, it'll take ${
		quantity
			? `between ${await formatTripDuration(user, fakeDurationMin)} **and** ${await formatTripDuration(user, fakeDurationMax)}`
			: await formatTripDuration(user, duration)
	} to finish.`;

	if (boosts.length > 0) {
		response += `\n\n**Boosts:** ${boosts.join(', ')}.`;
	}

	return response;
}
