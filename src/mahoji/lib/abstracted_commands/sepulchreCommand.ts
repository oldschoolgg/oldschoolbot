import { formatDuration, reduceNumByPercent, sumArr, Time } from '@oldschoolgg/toolkit';

import { sepulchreBoosts, sepulchreFloors } from '@/lib/minions/data/sepulchre.js';
import { zeroTimeFletchables } from '@/lib/skilling/skills/fletching/fletchables/index.js';
import type { SepulchreActivityTaskOptions } from '@/lib/types/minions.js';
import addSubTaskToActivityTask from '@/lib/util/addSubTaskToActivityTask.js';
import { calcMaxTripLength } from '@/lib/util/calcMaxTripLength.js';
import { updateBankSetting } from '@/lib/util/updateBankSetting.js';
import {
	type AttemptZeroTimeActivityOptions,
	attemptZeroTimeActivity,
	getZeroTimeActivityPreferences,
	getZeroTimeFletchTime,
	type ZeroTimeActivityPreference,
	type ZeroTimeActivityResult
} from '@/lib/util/zeroTimeActivity.js';
import { userHasGracefulEquipped } from '@/mahoji/mahojiSettings.js';

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
	if (!userHasGracefulEquipped(user)) {
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

	const maxLaps = Math.floor(calcMaxTripLength(user, 'Sepulchre') / lapLength);
	const tripLength = maxLaps * lapLength;

	type FletchResult = Extract<ZeroTimeActivityResult, { type: 'fletch' }>;
	type AlchResult = Extract<ZeroTimeActivityResult, { type: 'alch' }>;
	let fletchResult: FletchResult | null = null;
	let alchResult: AlchResult | null = null;
	const zeroTimeMessages: string[] = [];
	const preferences = getZeroTimeActivityPreferences(user);
	const failureMessages: string[] = [];

	for (const preference of preferences) {
		const label = preference.role === 'primary' ? 'Primary' : 'Fallback';

		const attemptOptions: AttemptZeroTimeActivityOptions =
			preference.type === 'alch'
				? {
						user,
						duration: tripLength,
						preference: preference as ZeroTimeActivityPreference & { type: 'alch' },
						variant: 'default',
						itemsPerHour: SEPULCHRE_ALCHES_PER_HOUR
					}
				: {
						user,
						duration: tripLength,
						preference: preference as ZeroTimeActivityPreference & { type: 'fletch' },
						...(resolveFletchItemsPerHour(preference)
							? { itemsPerHour: resolveFletchItemsPerHour(preference) }
							: {})
					};

		const attempt = attemptZeroTimeActivity(attemptOptions);

		if (attempt.result) {
			if (attempt.result.type === 'fletch') {
				fletchResult = attempt.result;
			} else {
				alchResult = attempt.result;
			}
			break;
		}

		if (attempt.message) {
			failureMessages.push(`${label} ${preference.type}: ${attempt.message}`);
		}
	}

	if (fletchResult) {
		await user.removeItemsFromBank(fletchResult.itemsToRemove);
	}

	if (alchResult) {
		await user.removeItemsFromBank(alchResult.bankToRemove);
		updateBankSetting('magic_cost_bank', alchResult.bankToRemove);
	}

	if (failureMessages.length > 0) {
		zeroTimeMessages.push(...failureMessages);
	}

	const zeroTimePreferenceRole = fletchResult?.preference.role ?? alchResult?.preference.role ?? null;

	await addSubTaskToActivityTask<SepulchreActivityTaskOptions>({
		floors: completableFloors.map(f => f.number),
		quantity: maxLaps,
		userID: user.id,
		duration: tripLength,
		type: 'Sepulchre',
		channelID: channelID.toString(),
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
