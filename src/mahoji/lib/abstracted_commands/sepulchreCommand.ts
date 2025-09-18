import { formatDuration } from '@oldschoolgg/toolkit/util';
import { Time, reduceNumByPercent, sumArr } from 'e';

import { sepulchreBoosts, sepulchreFloors } from '../../../lib/minions/data/sepulchre';
import type { SepulchreActivityTaskOptions } from '../../../lib/types/minions';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import { type ZeroTimeActivityResult, attemptZeroTimeActivity } from '../../../lib/util/zeroTimeActivity';
import { userHasGracefulEquipped } from '../../mahojiSettings';

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
	let fletchResult: FletchResult | null = null;
	let zeroTimeMessage: string | undefined;

	const zeroTime = attemptZeroTimeActivity({ type: 'fletch', user, duration: tripLength });
	if (zeroTime.result?.type === 'fletch') {
		fletchResult = zeroTime.result;
		await user.removeItemsFromBank(fletchResult.itemsToRemove);
	} else if (zeroTime.message) {
		zeroTimeMessage = zeroTime.message;
	}

	await addSubTaskToActivityTask<SepulchreActivityTaskOptions>({
		floors: completableFloors.map(f => f.number),
		quantity: maxLaps,
		userID: user.id,
		duration: tripLength,
		type: 'Sepulchre',
		channelID: channelID.toString(),
		minigameID: 'sepulchre',
		fletch: fletchResult ? { id: fletchResult.fletchable.id, qty: fletchResult.quantity } : undefined
	});

	let str = `${user.minionName} is now doing ${maxLaps} laps of the Sepulchre, in each lap they are doing floors ${
		completableFloors[0].number
	}-${completableFloors[completableFloors.length - 1].number}, the trip will take ${formatDuration(
		tripLength
	)}, with each lap taking ${formatDuration(lapLength)}.`;

	if (fletchResult) {
		const setsText = fletchResult.fletchable.outputMultiple ? ' sets of' : '';
		str += `\nYou are also now Fletching ${fletchResult.quantity}${setsText} ${fletchResult.fletchable.name}. Removed ${fletchResult.itemsToRemove} from your bank.`;
	} else if (zeroTimeMessage) {
		str += `\n${zeroTimeMessage}`;
	}

	if (boosts.length > 0) {
		str += `\n\n**Boosts:** ${boosts.join(', ')}.`;
	}

	return str;
}
