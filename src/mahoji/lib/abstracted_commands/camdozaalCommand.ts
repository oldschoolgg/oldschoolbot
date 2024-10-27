import { Time, increaseNumByPercent, reduceNumByPercent } from 'e';
import { Bank } from 'oldschooljs';
import { SkillsEnum } from 'oldschooljs/dist/constants';

import { determineMiningTime } from '../../../lib/skilling/functions/determineMiningTime';
import { pickaxes } from '../../../lib/skilling/functions/miningBoosts';
import Fishing from '../../../lib/skilling/skills/fishing';
import Mining from '../../../lib/skilling/skills/mining';
import type { ActivityTaskOptionsWithQuantity } from '../../../lib/types/minions';
import { formatDuration, itemNameFromID, randomVariation } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import { minionName } from '../../../lib/util/minionUtils';

async function miningCommand(user: MUser, channelID: string, quantity: number | undefined) {
	let miningLevel = user.skillLevel(SkillsEnum.Mining);
	if (miningLevel < 14) {
		return 'You need at least level 14 Mining to mine in the Ruins of Camdozaal.';
	}

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

	const glovesEffect = 0;
	const armourEffect = 0;
	const miningCapeEffect = 0;
	const goldSilverBoost = false;
	const powermine = false;
	const barroniteRocks = Mining.CamdozaalMine;

	// Calculate the time it takes to mine specific quantity or as many as possible
	const [duration, newQuantity] = determineMiningTime({
		quantity,
		gearBank: user.gearBank,
		ore: barroniteRocks,
		ticksBetweenRolls: currentPickaxe.ticksBetweenRolls,
		glovesEffect,
		armourEffect,
		miningCapeEffect,
		powermining: powermine,
		goldSilverBoost,
		miningLvl: miningLevel,
		maxTripLength: calcMaxTripLength(user, 'CamdozaalMining')
	});

	const fakeDurationMin = quantity ? randomVariation(reduceNumByPercent(duration, 25), 20) : duration;
	const fakeDurationMax = quantity ? randomVariation(increaseNumByPercent(duration, 25), 20) : duration;

	await addSubTaskToActivityTask<ActivityTaskOptionsWithQuantity>({
		userID: user.id,
		channelID: channelID.toString(),
		quantity: newQuantity,
		iQty: quantity ? quantity : undefined,
		duration,
		type: 'CamdozaalMining'
	});

	let response = `${minionName(user)} is now mining inside the Ruins of Camdozaal until your minion ${
		quantity ? `mined ${quantity}x barronite rocks or gets tired` : 'is satisfied'
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

async function smithingCommand(user: MUser, channelID: string, quantity: number | undefined) {
	if (user.skillLevel(SkillsEnum.Smithing) < 14) {
		return 'You need at least level 14 Smithing to smith in the Ruins of Camdozaal.';
	}

	const maxTripLength = calcMaxTripLength(user, 'CamdozaalSmithing');
	const timePerSmith = 3.5 * Time.Second;
	if (!quantity) {
		quantity = Math.floor(maxTripLength / timePerSmith);
	}

	const itemsNeeded = new Bank({ 'Barronite deposit': 1 }).clone();
	const maxCanDo = user.bank.fits(itemsNeeded);
	if (maxCanDo === 0) {
		return "You don't own a single Barronite deposit!";
	}
	if (maxCanDo < quantity) {
		quantity = maxCanDo;
	}

	const duration = timePerSmith * quantity;
	if (duration > maxTripLength) {
		return `${user.minionName} can't go on trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest amount of Barronite deposits you can smith is ${Math.floor(
			maxTripLength / timePerSmith
		)}.`;
	}

	await user.removeItemsFromBank(new Bank().add('Barronite deposit', quantity));

	await addSubTaskToActivityTask<ActivityTaskOptionsWithQuantity>({
		userID: user.id,
		channelID: channelID.toString(),
		quantity,
		duration,
		type: 'CamdozaalSmithing'
	});

	return `${user.minionName} is now smithing in the Ruins of Camdozaal, it will take around ${formatDuration(
		duration
	)} to finish.`;
}

async function fishingCommand(user: MUser, channelID: string, quantity: number | undefined) {
	if (user.skillLevel(SkillsEnum.Fishing) < 7) {
		return 'You need at least level 7 Fishing to fish in the Ruins of Camdozaal.';
	}
	const inputQuantity = quantity;

	const maxTripLength = calcMaxTripLength(user, 'CamdozaalFishing');
	const camdozaalfish = Fishing.camdozaalFishes.find(_fish => _fish.name === 'Raw guppy')!;
	const timePerFish = camdozaalfish.timePerFish * Time.Second;

	if (!quantity) {
		quantity = Math.floor(maxTripLength / timePerFish);
	}
	const duration = timePerFish * quantity;

	if (duration > maxTripLength) {
		return `${user.minionName} can't go on trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest amount of Camdozaal fish you can catch is ${Math.floor(
			maxTripLength / timePerFish
		)}.`;
	}

	await addSubTaskToActivityTask<ActivityTaskOptionsWithQuantity>({
		userID: user.id,
		channelID: channelID.toString(),
		quantity,
		iQty: inputQuantity,
		duration,
		type: 'CamdozaalFishing'
	});

	return `${user.minionName} is now fishing in the Ruins of Camdozaal, it will take around ${formatDuration(
		duration
	)} to finish.`;
}
export async function camdozaalCommand(user: MUser, channelID: string, choice: string, quantity: number | undefined) {
	const qp = user.QP;
	if (qp <= 16) {
		return "You haven't completed enough quests to enter the Ruins of Camdozaal, return when you have at least 17 quest points.";
	}
	if (choice === 'mining') {
		return miningCommand(user, channelID, quantity);
	}
	if (choice === 'smithing') {
		return smithingCommand(user, channelID, quantity);
	}
	return fishingCommand(user, channelID, quantity);
}
