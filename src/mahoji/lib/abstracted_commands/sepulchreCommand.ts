import { formatDuration, reduceNumByPercent, sumArr, Time } from '@oldschoolgg/toolkit';

import { sepulchreBoosts, sepulchreFloors } from '@/lib/minions/data/sepulchre.js';
import { zeroTimeFletchables } from '@/lib/skilling/skills/fletching/fletchables/index.js';
import type { SepulchreActivityTaskOptions } from '@/lib/types/minions.js';
import addSubTaskToActivityTask from '@/lib/util/addSubTaskToActivityTask.js';
import { calcMaxTripLength } from '@/lib/util/calcMaxTripLength.js';
import { updateBankSetting } from '@/lib/util/updateBankSetting.js';
import {
	attemptZeroTimeActivity,
	getZeroTimeActivitySettings,
	getZeroTimeFletchTime,
	type ZeroTimeActivityResult
} from '@/lib/util/zeroTimeActivity.js';
import { userHasGracefulEquipped } from '@/mahoji/mahojiSettings.js';

const SEPULCHRE_ALCHES_PER_HOUR = 1000;

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

	// Base data
	const completableFloors = sepulchreFloors.filter(f => agilityLevel >= f.agilityLevel);
	let lapLength = sumArr(completableFloors.map(f => f.time));

	// Boosts
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

	const zeroTimeSettings = getZeroTimeActivitySettings(user);

	if (zeroTimeSettings?.type === 'fletch') {
		const configuredFletchable = zeroTimeFletchables.find(item => item.id === zeroTimeSettings.itemID);
		let itemsPerHour: number | undefined;
		if (configuredFletchable) {
			const timePerItem = getZeroTimeFletchTime(configuredFletchable);
			if (timePerItem) {
				const outputMultiple = configuredFletchable.outputMultiple ?? 1;
				itemsPerHour = (Time.Hour / timePerItem) * outputMultiple;
			}
		}

		const zeroTime = attemptZeroTimeActivity({
			type: 'fletch',
			user,
			duration: tripLength,
			...(itemsPerHour ? { itemsPerHour } : {})
		});
		if (zeroTime.result?.type === 'fletch') {
			fletchResult = zeroTime.result;
			await user.removeItemsFromBank(fletchResult.itemsToRemove);
		} else if (zeroTime.message) {
			zeroTimeMessages.push(zeroTime.message);
		}
	} else if (zeroTimeSettings?.type === 'alch') {
		const zeroTime = attemptZeroTimeActivity({
			type: 'alch',
			user,
			duration: tripLength,
			itemsPerHour: SEPULCHRE_ALCHES_PER_HOUR,
			variant: 'default'
		});
		if (zeroTime.result?.type === 'alch') {
			alchResult = zeroTime.result;
			await user.removeItemsFromBank(alchResult.bankToRemove);
			updateBankSetting('magic_cost_bank', alchResult.bankToRemove);
		} else if (zeroTime.message) {
			zeroTimeMessages.push(zeroTime.message);
		}
	}

	await addSubTaskToActivityTask<SepulchreActivityTaskOptions>({
		floors: completableFloors.map(f => f.number),
		quantity: maxLaps,
		userID: user.id,
		duration: tripLength,
		type: 'Sepulchre',
		channelID: channelID.toString(),
		minigameID: 'sepulchre',
		fletch: fletchResult ? { id: fletchResult.fletchable.id, qty: fletchResult.quantity } : undefined,
		alch: alchResult ? { itemID: alchResult.item.id, quantity: alchResult.quantity } : undefined
	});

	let str = `${user.minionName} is now doing ${maxLaps} laps of the Sepulchre, in each lap they are doing floors ${
		completableFloors[0].number
	}-${completableFloors[completableFloors.length - 1].number}, the trip will take ${formatDuration(
		tripLength
	)}, with each lap taking ${formatDuration(lapLength)}.`;

	if (fletchResult) {
		const setsText = fletchResult.fletchable.outputMultiple ? ' sets of' : '';
		str += `\nYou are also now Fletching ${fletchResult.quantity}${setsText} ${fletchResult.fletchable.name}. Removed ${fletchResult.itemsToRemove} from your bank.`;
	}
	if (alchResult) {
		str += `\nYou are also now alching ${alchResult.quantity}x ${alchResult.item.name} while clearing the Sepulchre. Removed ${alchResult.bankToRemove} from your bank.`;
	}
	if (!fletchResult && !alchResult && zeroTimeMessages.length > 0) {
		str += `\n${zeroTimeMessages.join('\n')}`;
	}

	if (boosts.length > 0) {
		str += `\n\n**Boosts:** ${boosts.join(', ')}.`;
	}

	return str;
}
