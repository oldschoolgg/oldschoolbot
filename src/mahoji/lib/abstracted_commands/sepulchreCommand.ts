import { formatDuration, reduceNumByPercent, sumArr, Time } from '@oldschoolgg/toolkit';

import { sepulchreBoosts, sepulchreFloors } from '@/lib/minions/data/sepulchre.js';
import type { ActivityTaskData } from '@/lib/types/minions.js';
import addSubTaskToActivityTask from '@/lib/util/addSubTaskToActivityTask.js';
import { formatTripDuration } from '@/lib/util/minionUtils.js';
import {
	getZeroTimeActivityPreferences,
	prepareZeroTimeActivityTrip,
	resolveConfiguredFletchItemsPerHour
} from '@/lib/util/zeroTimeActivity.js';

const SEPULCHRE_ALCHES_PER_HOUR = 1000;

export async function sepulchreCommand(user: MUser, channelId: string) {
	const skills = user.skillsAsLevels;
	const agilityLevel = skills.agility;
	const thievingLevel = skills.thieving;

	if (agilityLevel < sepulchreFloors[0].agilityLevel) {
		return `You need at least level ${sepulchreFloors[0].agilityLevel} Agility to do the Hallowed Sepulchre.`;
	}
	if (thievingLevel < 66) {
		return 'You need at least level 66 Thieving to do the Hallowed Sepulchre.';
	}
	if (!user.hasGracefulEquipped()) {
		return 'You need Graceful equipped in any setup to do the Hallowed Sepulchre.';
	}

	const completableFloors = sepulchreFloors.filter(f => agilityLevel >= f.agilityLevel);
	let lapLength = sumArr(completableFloors.map(f => f.time));

	const percentReduced = Math.min(
		Math.floor((await user.fetchMinigameScore('sepulchre')) / (Time.Hour / lapLength)),
		10
	);
	lapLength = reduceNumByPercent(lapLength, percentReduced);
	const boosts = [`${percentReduced.toFixed(1)}% for minion learning`];

	for (const [item, percent] of sepulchreBoosts.items()) {
		if (user.hasEquippedOrInBank(item.id)) {
			boosts.push(`${percent}% for ${item.name}`);
			lapLength = reduceNumByPercent(lapLength, percent);
		}
	}

	const maxLaps = Math.floor((await user.calcMaxTripLength('Sepulchre')) / lapLength);
	const tripLength = maxLaps * lapLength;

	const preferences = getZeroTimeActivityPreferences(user);
	const {
		fletchResult,
		alchResult,
		infoMessages: zeroTimeMessages,
		zeroTimePreferenceRole
	} = await prepareZeroTimeActivityTrip({
		user,
		duration: tripLength,
		preferences,
		removeItems: true,
		alch: { variant: 'default', itemsPerHour: SEPULCHRE_ALCHES_PER_HOUR },
		fletch: { itemsPerHour: preference => resolveConfiguredFletchItemsPerHour(preference) }
	});

	const task = {
		floors: completableFloors.map(f => f.number),
		quantity: maxLaps,
		userID: user.id,
		duration: tripLength,
		type: 'Sepulchre',
		channelId,
		minigameID: 'sepulchre',
		fletch: fletchResult ? { id: fletchResult.fletchable.id, qty: fletchResult.quantity } : undefined,
		alch: alchResult ? { itemID: alchResult.item.id, quantity: alchResult.quantity } : undefined,
		zeroTimePreferenceRole
	} satisfies Omit<Extract<ActivityTaskData, { type: 'Sepulchre' }>, 'finishDate' | 'id'>;

	await addSubTaskToActivityTask(task);

	let str = `${user.minionName} is now doing ${maxLaps} laps of the Sepulchre, in each lap they are doing floors ${
		completableFloors[0].number
	}-${completableFloors[completableFloors.length - 1].number}, the trip will return in about ${formatTripDuration(user, tripLength)}, with each lap taking ${formatDuration(lapLength)}.`;

	if (fletchResult) {
		const setsText = fletchResult.fletchable.outputMultiple ? ' sets of' : '';
		const fallbackNote = zeroTimePreferenceRole === 'fallback' ? ' (fallback preference)' : '';
		str += `\nYou are also now Fletching ${fletchResult.quantity}${setsText} ${fletchResult.fletchable.name}${fallbackNote}. Removed ${fletchResult.itemsToRemove} from your bank.`;
	}
	if (alchResult) {
		const fallbackNote = zeroTimePreferenceRole === 'fallback' ? ' (fallback preference)' : '';
		str += `\nYou are also now alching ${alchResult.quantity}x ${alchResult.item.name}${fallbackNote} while clearing the Sepulchre. Removed ${alchResult.bankToRemove} from your bank.`;
	}
	if (zeroTimeMessages.length > 0) {
		str += `\n${zeroTimeMessages.join('\n')}`;
	}

	if (boosts.length > 0) {
		str += `\n\n**Boosts:** ${boosts.join(', ')}.`;
	}

	return str;
}
