import { Time } from 'e';
import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import {
	fishingLocations,
	getCurrentFishType,
	getTopDailyFishingCatch,
	getUsersFishingContestDetails,
	getValidLocationsForFishType
} from '../../../lib/fishingContest';
import { getMinigameScore } from '../../../lib/settings/minigames';
import { trackLoot } from '../../../lib/settings/prisma';
import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import { FishingContestOptions } from '../../../lib/types/minions';
import { formatDuration, stringMatches, updateBankSetting } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';

export async function fishingContestStartCommand(user: KlasaUser, channelID: bigint, loc: string) {
	if (!loc) return fishingContestStatsCommand(user);
	const fishingLocation = fishingLocations.find(i => stringMatches(i.name, loc));
	if (!fishingLocation) {
		return `That's not a valid location to fish at, you can fish at these locations: ${fishingLocations
			.map(i => `${i.name}(${i.temperature} ${i.water})`)
			.join(', ')}.`;
	}
	const currentFishType = getCurrentFishType();
	const validLocs = getValidLocationsForFishType(currentFishType);
	if (!validLocs.includes(fishingLocation)) {
		return `This Fishing Location isn't valid for todays catch! These ones are: ${validLocs
			.map(i => i.name)
			.join(', ')}`;
	}

	if (!['Contest rod', "Beginner's tackle box"].every(i => user.hasItemEquippedOrInBank(i))) {
		return 'You need to buy a Contest rod and a tackle box to compete in the Fishing contest.';
	}
	if (user.minionIsBusy) {
		return 'Your minion is busy.';
	}
	let quantity = 1;
	let duration = Math.floor(quantity * Time.Minute * 1.69);
	let quantityBoosts = [];

	const tackleBoxes = ["Champion's tackle box", 'Professional tackle box', 'Standard tackle box', 'Basic tackle box'];
	for (let i = 0; i < tackleBoxes.length; i++) {
		if (user.hasItemEquippedOrInBank(tackleBoxes[i])) {
			let num = tackleBoxes.length - i;
			quantityBoosts.push(`${num} for ${tackleBoxes[i]}`);
			quantity += num;
			break;
		}
	}

	if (user.hasItemEquippedOrInBank('Crystal fishing rod')) {
		quantity++;
		quantityBoosts.push('1 for Crystal fishing rod');
	}

	const result = await getUsersFishingContestDetails(user);
	if (result.catchesFromToday.length > 0) {
		return `You already participated in the Fishing Contest today. You caught: ${result.catchesFromToday
			.map(i => `${i.name}(${i.length_cm / 100}m)`)
			.join(', ')}.`;
	}

	const cost = new Bank().add(fishingLocation.bait.id, quantity);
	if (!user.owns(cost)) {
		return `You need ${cost} to bait fish at ${fishingLocation.name}.`;
	}
	await user.removeItemsFromBank(cost);
	await updateBankSetting(globalClient, ClientSettings.EconomyStats.FishingContestCost, cost);

	await addSubTaskToActivityTask<FishingContestOptions>({
		userID: user.id,
		channelID: channelID.toString(),
		quantity,
		duration,
		type: 'FishingContest',
		minigameID: 'fishing_contest',
		location: fishingLocation.id
	});

	await trackLoot({
		cost,
		id: 'fishing_contest',
		type: 'Minigame',
		changeType: 'cost'
	});

	return {
		content: `${user.minionName} is now off to catch ${quantity === 1 ? 'a' : quantity} fish at ${
			fishingLocation.name
		}, they will return in ${formatDuration(duration)}. Removed ${cost} from your bank.${
			quantity > 1
				? `
You're fishing ${quantity - 1} extra fish: ${quantityBoosts.join(', ')}`
				: ''
		}`
	};
}

export async function fishingContestStatsCommand(user: KlasaUser) {
	const currentFishType = getCurrentFishType();
	const [userDetails, topCatches, minigameScore] = await Promise.all([
		getUsersFishingContestDetails(user),
		getTopDailyFishingCatch(),
		getMinigameScore(user.id, 'fishing_contest')
	]);
	const validLocs = getValidLocationsForFishType(currentFishType);
	return `**Fishing Contest**

You can participate using \`/bsominigames fishing_contest fish [location]\`

**Todays Catch:** A fish from a ${currentFishType.temperature} ${currentFishType.water} (${validLocs
		.map(i => i.name)
		.join(', ')})
**Todays Catches:** ${userDetails.catchesFromToday
		.sort((a, b) => b.length_cm - a.length_cm)
		.map(i => `${i.name}(${i.length_cm / 100}m)`)
		.join(', ')}
**Total Daily Contests:** ${minigameScore}
**All-time catches:** ${userDetails.catchesAllTime}
**Total Unique Catches:** ${userDetails.totalUniqueCatches}
**Total Length of Fish:** ${userDetails.totalLength / 100}m
**Daily Catch Leaderboard:** ${topCatches.map(i => `${i.name}(${i.length_cm / 100}m)`).join(', ')}`;
}
