import { formatDuration, reduceNumByPercent, sumArr, Time } from '@oldschoolgg/toolkit';

import { sepulchreBoosts, sepulchreFloors } from '@/lib/minions/data/sepulchre.js';
import { zeroTimeFletchables } from '@/lib/skilling/skills/fletching/fletchables/index.js';
import type { SepulchreActivityTaskOptions } from '@/lib/types/minions.js';
import addSubTaskToActivityTask from '@/lib/util/addSubTaskToActivityTask.js';
import {
	attemptZeroTimeActivity,
	describeZeroTimePreference,
	getZeroTimeActivityPreferences,
	getZeroTimeFletchTime,
	getZeroTimePreferenceLabel,
	type ZeroTimeActivityPreference,
	type ZeroTimeActivityResult
} from '@/lib/util/zeroTimeActivity.js';

const SEPULCHRE_ALCHES_PER_HOUR = 1000;

function resolveFletchItemsPerHour(preference: ZeroTimeActivityPreference) {
	if (!preference.itemID) {
		return undefined;
	}
	const configuredFletchable = zeroTimeFletchables.find(item => item.id === preference.itemID);
	if (!configuredFletchable) {
		return undefined;
	}
	const timePerItem = getZeroTimeFletchTime(configuredFletchable);
	if (!timePerItem) {
		return undefined;
	}
	const outputMultiple = configuredFletchable.outputMultiple ?? 1;
	return (Time.Hour / timePerItem) * outputMultiple;
}

export async function sepulchreCommand(user: MUser, channelID: string) {
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

	const maxLaps = Math.floor(user.calcMaxTripLength('Sepulchre') / lapLength);
	const tripLength = maxLaps * lapLength;

	type FletchResult = Extract<ZeroTimeActivityResult, { type: 'fletch' }>;
	type AlchResult = Extract<ZeroTimeActivityResult, { type: 'alch' }>;
	let fletchResult: FletchResult | null = null;
	let alchResult: AlchResult | null = null;
	const zeroTimeMessages: string[] = [];
	const preferences = getZeroTimeActivityPreferences(user);

	if (preferences.length > 0) {
		const outcome = attemptZeroTimeActivity({
			user,
			duration: tripLength,
			preferences,
			alch: { variant: 'default', itemsPerHour: SEPULCHRE_ALCHES_PER_HOUR },
			fletch: { itemsPerHour: preference => resolveFletchItemsPerHour(preference) }
		});

		if (outcome.result?.type === 'fletch') {
			fletchResult = outcome.result;
		} else if (outcome.result?.type === 'alch') {
			alchResult = outcome.result;
		}

		const formattedFailures = outcome.failures
			.filter(failure => failure.message)
			.map(failure => `${getZeroTimePreferenceLabel(failure.preference)}: ${failure.message}`);

		if (outcome.result) {
			if (outcome.result.preference.role === 'fallback') {
				const fallbackDescription = describeZeroTimePreference(outcome.result.preference);
				const prefix = formattedFailures.length > 0 ? `${formattedFailures.join(' ')} ` : '';
				zeroTimeMessages.push(`${prefix}Falling back to ${fallbackDescription}.`.trim());
			}
		} else if (formattedFailures.length > 0) {
			zeroTimeMessages.push(...formattedFailures);
		}
	}

	if (fletchResult) {
		await user.removeItemsFromBank(fletchResult.itemsToRemove);
	}

	if (alchResult) {
		await user.removeItemsFromBank(alchResult.bankToRemove);
		await ClientSettings.updateBankSetting('magic_cost_bank', alchResult.bankToRemove);
	}

	const zeroTimePreferenceRole = fletchResult?.preference.role ?? alchResult?.preference.role ?? null;

	await addSubTaskToActivityTask<SepulchreActivityTaskOptions>({
		floors: completableFloors.map(f => f.number),
		quantity: maxLaps,
		userID: user.id,
		duration: tripLength,
		type: 'Sepulchre',
		channelID,
		minigameID: 'sepulchre',
		fletch: fletchResult ? { id: fletchResult.fletchable.id, qty: fletchResult.quantity } : undefined,
		alch: alchResult ? { itemID: alchResult.item.id, quantity: alchResult.quantity } : undefined,
		zeroTimePreferenceRole
	});

	let str = `${user.minionName} is now doing ${maxLaps} laps of the Sepulchre, in each lap they are doing floors ${
		completableFloors[0].number
	}-${completableFloors[completableFloors.length - 1].number}, the trip will take ${formatDuration(
		tripLength
	)}, with each lap taking ${formatDuration(lapLength)}.`;

	if (fletchResult) {
		const setsText = fletchResult.fletchable.outputMultiple ? ' sets of' : '';
		const fallbackNote = fletchResult.preference.role === 'fallback' ? ' (fallback preference)' : '';
		str += `\nYou are also now Fletching ${fletchResult.quantity}${setsText} ${fletchResult.fletchable.name}${fallbackNote}. Removed ${fletchResult.itemsToRemove} from your bank.`;
	}
	if (alchResult) {
		const fallbackNote = alchResult.preference.role === 'fallback' ? ' (fallback preference)' : '';
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
