import { increaseNumByPercent, reduceNumByPercent } from 'e';
import { randomVariation } from 'oldschooljs/dist/util';

import { determineMiningTime } from '../../../lib/skilling/functions/determineMiningTime';
import Mining from '../../../lib/skilling/skills/mining';
import { MotherlodeMiningActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration, itemNameFromID, stringMatches } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { minionName } from '../../../lib/util/minionUtils';
import { pickaxes } from '../../commands/mine';

export async function motherlodeMineCommand({
	user,
	channelID,
	name,
	quantity
}: {
	user: MUser;
	channelID: string;
	name: string;
	quantity?: number;
	powermine?: boolean;
}) {
	if (user.skillsAsLevels.mining < 30) {
		return `${minionName(user)} needs 30 Mining to mine ${name}.`;
	}

	const ore = Mining.MotherlodeMines.find(
		ore =>
			stringMatches(ore.id, name) || stringMatches(ore.name, name) || stringMatches(ore.name.split(' ')[0], name)
	);

	if (!ore) {
		return `Thats not a valid ore to mine. Valid ores are ${Mining.Ores.map(ore => ore.name).join(
			', '
		)}, ${Mining.MotherlodeMines.map(name => name.name).join(', ')}.`;
	}

	let miningLevel = user.skillsAsLevels.mining;

	const boosts = [];
	// Checks if user own Celestial ring or Celestial signet
	if (user.hasEquippedOrInBank(['Celestial ring (uncharged)'])) {
		boosts.push('+4 invisible Mining lvls for Celestial ring');
		miningLevel += 4;
	}
	// Default bronze pickaxe, last in the array
	let currentPickaxe = pickaxes[pickaxes.length - 1];
	boosts.push(`**${currentPickaxe.ticksBetweenRolls}** ticks between rolls for ${itemNameFromID(currentPickaxe.id)}`);

	// For each pickaxe, if they have it, give them its' bonus and break.
	for (const pickaxe of pickaxes) {
		if (!user.hasEquippedOrInBank([pickaxe.id]) || user.skillsAsLevels.mining < pickaxe.miningLvl) continue;
		currentPickaxe = pickaxe;
		boosts.pop();
		boosts.push(`**${pickaxe.ticksBetweenRolls}** ticks between rolls for ${itemNameFromID(pickaxe.id)}`);
		break;
	}

	// Check for 100 golden nuggets and 72 mining for upper motherlode mine access.
	const gotNuggets = user.cl.amount('Golden nugget') >= 100;
	if (gotNuggets && miningLevel >= 72) {
		ore.respawnTime = 4;
		ore.bankingTime = 40;
		boosts.push(
			'\nYou are mining on the upper level of the motherlode mine, due to having 100 golden nuggets in your cl and 72 mining or higher'
		);
	}

	const glovesRate = 0;
	const armourEffect = 0;
	const miningCapeEffect = 0;
	const goldSilverBoost = false;
	const powermine = false;

	// Calculate the time it takes to mine specific quantity or as many as possible
	let [timeToMine, newQuantity] = determineMiningTime({
		quantity,
		user,
		ore,
		ticksBetweenRolls: currentPickaxe.ticksBetweenRolls,
		glovesRate,
		armourEffect,
		miningCapeEffect,
		powermining: powermine,
		goldSilverBoost,
		miningLvl: miningLevel
	});

	const duration = timeToMine;

	const fakeDurationMin = quantity ? randomVariation(reduceNumByPercent(duration, 25), 20) : duration;
	const fakeDurationMax = quantity ? randomVariation(increaseNumByPercent(duration, 25), 20) : duration;

	await addSubTaskToActivityTask<MotherlodeMiningActivityTaskOptions>({
		oreID: ore.id,
		userID: user.id,
		channelID,
		quantity: newQuantity,
		duration,
		fakeDurationMax,
		fakeDurationMin,
		type: 'MotherlodeMining'
	});
	let response = `${minionName(user)} is now mining at the ${ore.name} until your minion ${
		quantity ? `mined ${quantity}x or gets tired` : 'is satisfied'
	}, it'll take ${
		quantity
			? `between ${formatDuration(fakeDurationMin)} **and** ${formatDuration(fakeDurationMax)}`
			: formatDuration(duration)
	} to finish.`;

	if (boosts.length > 0) {
		response += `\n\n**Boosts:** ${boosts.join(', ')}.`;
	}

	return response;
}
