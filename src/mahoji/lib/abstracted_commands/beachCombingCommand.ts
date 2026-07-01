import { BSOItem } from '@/lib/bso/BSOItem.js';
import { getEclipsePetName } from '@/lib/bso/summerDays.js';

import { EmbedBuilder } from '@oldschoolgg/discord';
import { Time } from '@oldschoolgg/toolkit';

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
	BSOItem.WHALE_FLOATY,
	BSOItem.PARTYCRAB,
	BSOItem.PATRICIA
];

function countSummerCratePiecesEquipped(user: MUser) {
	return summerCrateRewardIDs.filter(itemID => user.hasEquipped(itemID)).length;
}

export async function beachCombingCommand(user: MUser, channelId: string, focus: BeachCombingMethod, minutes?: number) {
	const baseMaxTripLength = await user.calcMaxTripLength('BeachCombing');
	const summerPiecesEquipped = countSummerCratePiecesEquipped(user);
	const bonusDuration = summerPiecesEquipped * Time.Minute * 5;
	let duration = baseMaxTripLength + bonusDuration;
	if (minutes && minutes < 10) minutes = 10;
	duration = Math.min(duration, minutes ? minutes * Time.Minute : duration);
	const hasPatricia = user.usingPet('Patricia');
	const eclipsePetName = hasPatricia ? getEclipsePetName(user) : 'Patricia';
	const hasPatriciaAndCage = hasPatricia && user.hasEquipped(BSOItem.OLD_CRAB_CAGE);

	await ActivityManager.startTrip<BeachCombingActivityTaskOptions>({
		userID: user.id,
		channelId,
		duration,
		type: 'BeachCombing',
		method: focus,
		minutes
	});

	const focusLine = {
		Surfing: 'They will spend the trip chasing decent waves and washed-up curios.',
		BeachCombing: 'They will comb every patch of sand they can reach.',
		BuildSandcastles: 'They will construct deeply unserious sand architecture while keeping an eye out for finds.',
		PickupTrash: 'They will clean the shoreline and salvage anything interesting in the process.'
	}[focus];

	const responses: string[] = [];
	responses.push(
		`${user.minionName} is now beach combing and will wash back in around ${formatTripDuration(user, duration)}.`
	);
	if (hasPatricia) {
		responses.push(
			`<:starfish:1515651612918677564> ${eclipsePetName} gives you the encouragement needed to stay longer... You might get sun-burned.`
		);
	}
	if (user.usingPet('Shelldon')) {
		responses.push(
			`<:shelldon:748496988407988244> You're getting sunburned because Shelldon forgot the Sun scream.... Apparently not a typo?`
		);
	}
	if (user.usingPet('Partycrab')) {
		responses.push(
			`<:partycrab:1507689107806097541> You stay out so long partying with your Partycrab that you forgot what day it is and wound up in a port I call Aransas`
		);
	}
	if (summerPiecesEquipped > 0) {
		responses.push(`Your Summer crate gear added ${summerPiecesEquipped * 5} extra minutes to the trip.`);
	}
	responses.push(` ${focusLine}`);
	if (hasPatriciaAndCage && !user.cl.has(BSOItem.PARTYCRAB)) {
		responses.push(
			`${eclipsePetName} taps the old crab cage against the sand, but this shoreline isn't where that answer lives.`
		);
	}

	const content = responses.shift();
	const embed = new EmbedBuilder()
		.setDescription(responses.join(', '))
		.setImage('https://cdn.discordapp.com/attachments/851273567416483861/1515904314780942368/content.png');

	return {
		content,
		embeds: [embed]
	};
}
