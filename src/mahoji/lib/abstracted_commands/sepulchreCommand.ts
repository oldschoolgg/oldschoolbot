import { Time, reduceNumByPercent, sumArr } from 'e';
import type { Bank } from 'oldschooljs';

import { formatDuration } from '@oldschoolgg/toolkit/util';
import { sepulchreBoosts, sepulchreFloors } from '../../../lib/minions/data/sepulchre';
import { getMinigameScore } from '../../../lib/settings/minigames';
import { zeroTimeFletchables } from '../../../lib/skilling/skills/fletching/fletchables';
import Arrows from '../../../lib/skilling/skills/fletching/fletchables/arrows';
import Bolts from '../../../lib/skilling/skills/fletching/fletchables/bolts';
import Darts from '../../../lib/skilling/skills/fletching/fletchables/darts';
import Javelins from '../../../lib/skilling/skills/fletching/fletchables/javelins';
import { AmethystBroadBolts, BroadArrows, BroadBolts } from '../../../lib/skilling/skills/fletching/fletchables/slayer';
import TippedBolts from '../../../lib/skilling/skills/fletching/fletchables/tippedBolts';
import TippedDragonBolts from '../../../lib/skilling/skills/fletching/fletchables/tippedDragonBolts';
import type { Fletchable } from '../../../lib/skilling/types';
import type { SlayerTaskUnlocksEnum } from '../../../lib/slayer/slayerUnlocks';
import { hasSlayerUnlock } from '../../../lib/slayer/slayerUtil';
import type { SepulchreActivityTaskOptions } from '../../../lib/types/minions';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import { userHasGracefulEquipped } from '../../mahojiSettings';

export async function sepulchreCommand(user: MUser, channelID: string, fletching?: number) {
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
		Math.floor((await getMinigameScore(user.id, 'sepulchre')) / (Time.Hour / lapLength)),
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

	let fletchable: Fletchable | undefined;

	let fletchingQuantity = 0;
	let sets = '';
	let itemsNeeded: Bank | undefined;
	let timeToFletchSingleItem = 0;

	if (fletching) {
		fletchable = zeroTimeFletchables.find(item => item.id === Number(fletching));
		if (!fletchable) return 'That is not a valid item to fletch during Sepulchre.';

		if (user.skillLevel('fletching') < fletchable.level) {
			return `${user.minionName} needs ${fletchable.level} Fletching to fletch ${fletchable.name}.`;
		}

		if (fletchable.requiredSlayerUnlocks) {
			const { success, errors } = hasSlayerUnlock(
				user.user.slayer_unlocks as SlayerTaskUnlocksEnum[],
				fletchable.requiredSlayerUnlocks
			);
			if (!success) {
				return `You don't have the required Slayer Unlocks to create this item.\n\nRequired: ${errors}`;
			}
		}

		// Determine fletching speed
		const fletchableTypes = [
			{ types: [Darts, Bolts, BroadBolts], time: Time.Second * 0.2 },
			{
				types: [Arrows, BroadArrows, Javelins, TippedBolts, TippedDragonBolts, AmethystBroadBolts],
				time: Time.Second * 0.36
			}
		];
		for (const { types, time } of fletchableTypes) {
			if (types.some(type => (Array.isArray(type) ? type.includes(fletchable!) : type === fletchable))) {
				timeToFletchSingleItem = time;
				break;
			}
		}
		if (timeToFletchSingleItem === 0) return 'Error selecting fletchable.';

		fletchingQuantity = Math.floor(tripLength / timeToFletchSingleItem);
		if (fletchable.outputMultiple) sets = ' sets of';

		const max = user.bank.fits(fletchable.inputItems);
		if (max < fletchingQuantity && max !== 0) fletchingQuantity = max;

		itemsNeeded = fletchable.inputItems.clone().multiply(fletchingQuantity);
		if (!user.bankWithGP.has(itemsNeeded)) {
			return `You don't have enough items. For ${fletchingQuantity}x ${fletchable.name}, you're missing **${itemsNeeded
				.clone()
				.remove(user.bank)}**.`;
		}

		await user.removeItemsFromBank(itemsNeeded);
	}

	await addSubTaskToActivityTask<SepulchreActivityTaskOptions>({
		floors: completableFloors.map(f => f.number),
		quantity: maxLaps,
		userID: user.id,
		duration: tripLength,
		type: 'Sepulchre',
		channelID: channelID.toString(),
		minigameID: 'sepulchre',
		fletch: fletchable ? { id: fletchable.id, qty: fletchingQuantity } : undefined
	});

	let str = `${user.minionName} is now doing ${maxLaps} laps of the Sepulchre, in each lap they are doing floors ${
		completableFloors[0].number
	}-${completableFloors[completableFloors.length - 1].number}, the trip will take ${formatDuration(
		tripLength
	)}, with each lap taking ${formatDuration(lapLength)}.`;

	if (fletchable && itemsNeeded) {
		str += `\nYou are also now Fletching ${fletchingQuantity}${sets} ${fletchable.name}. Removed ${itemsNeeded} from your bank.`;
	}

	if (boosts.length > 0) {
		str += `\n\n**Boosts:** ${boosts.join(', ')}.`;
	}

	return str;
}
