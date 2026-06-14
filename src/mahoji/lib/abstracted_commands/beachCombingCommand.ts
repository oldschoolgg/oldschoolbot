import { BSOItem } from '@/lib/bso/BSOItem.js';

import { Time } from '@oldschoolgg/toolkit';
import { Items } from 'oldschooljs';

import type { BeachCombingActivityTaskOptions, BeachCombingMethod } from '@/lib/types/minions.js';
import { formatTripDuration } from '@/lib/util/minionUtils.js';

const summerCrateRewardIDs = [
	BSOItem.IMITATION_CRABHAT,
	BSOItem.SUMMER_PARTYHAT,
	BSOItem.CORAL_BIKINI_TOP,
	BSOItem.CORAL_BIKINI_BOTTOM,
	BSOItem.PALM_BOARD_SHORTS,
	BSOItem.BEACH_SANDALS,
	BSOItem.BEACHBALL_SHIELD,
	BSOItem.BEACH_PINA_COLADA,
	BSOItem.WHALE_FLOATY
];

const summerCrateWearables = new Set(
	summerCrateRewardIDs.filter(itemID => Boolean(Items.getOrThrow(itemID).equipment))
);

function countSummerCratePiecesEquipped(user: MUser) {
	const equippedPieces = new Set<number>();
	for (const setup of Object.values(user.gear)) {
		for (const itemID of setup.allItems(false)) {
			if (summerCrateWearables.has(itemID)) {
				equippedPieces.add(itemID);
			}
		}
	}
	return equippedPieces.size;
}

export async function beachCombingCommand(user: MUser, channelId: string, focus: BeachCombingMethod) {
	const baseMaxTripLength = await user.calcMaxTripLength('BeachCombing');
	const summerPiecesEquipped = countSummerCratePiecesEquipped(user);
	let bonusDuration = summerPiecesEquipped * Time.Minute * 5;
	if (user.usingPet('Patricia')) {
		bonusDuration += Time.Minute * 10;
	}
	if (user.usingPet('Shelldon')) {
		bonusDuration += Time.Minute * 5;
	}
	if (user.usingPet('Partycrab')) {
		bonusDuration += Time.Minute * 10;
	}
	const duration = baseMaxTripLength + bonusDuration;
	const hasPatriciaAndCage = user.usingPet('Patricia') && user.hasEquipped(BSOItem.OLD_CRAB_CAGE);

	await ActivityManager.startTrip<BeachCombingActivityTaskOptions>({
		userID: user.id,
		channelId,
		duration,
		type: 'BeachCombing',
		method: focus
	});

	const focusLine = {
		Surfing: 'They will spend the trip chasing decent waves and washed-up curios.',
		BeachCombing: 'They will comb every patch of sand they can reach.',
		BuildSandcastles: 'They will construct deeply unserious sand architecture while keeping an eye out for finds.',
		PickupTrash: 'They will clean the shoreline and salvage anything interesting in the process.'
	}[focus];

	let response = `${user.minionName} is now beach combing and will wash back in around ${formatTripDuration(
		user,
		duration
	)}.`;
	if (user.usingPet('Patricia')) {
		response += `<:starfish:1515651612918677564> Patricia gives you the encouragement needed to stay longer... You might get sun-burned.`;
	}
	if (user.usingPet('Shelldon')) {
		response += `<:shelldon:748496988407988244> You're getting sunburned because Shelldon forgot the sun scream.... Apparently not a typo?`;
	}
	if (user.usingPet('Partycrab')) {
		response += `<:partycrab:1507689107806097541> You stay out so long partying with your Partycrab that you forgot what day it is and wound up in a port I call Aransas`;
	}
	if (summerPiecesEquipped > 0) {
		response += ` Your Summer crate gear added ${summerPiecesEquipped * 5} extra minutes to the trip.`;
	}
	response += ` ${focusLine}`;
	if (hasPatriciaAndCage && !user.cl.has(BSOItem.PARTYCRAB)) {
		response += ` Patricia taps the old crab cage against the sand, but this shoreline isn't where that answer lives.`;
	}
	return response;
}
