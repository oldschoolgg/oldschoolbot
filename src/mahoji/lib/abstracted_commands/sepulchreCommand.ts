import { formatDuration, stringMatches } from '@oldschoolgg/toolkit';
import { Time, reduceNumByPercent, sumArr } from 'e';
import type { Bank } from 'oldschooljs';
import { sepulchreBoosts, sepulchreFloors } from '../../../lib/minions/data/sepulchre';
import { getMinigameScore } from '../../../lib/settings/minigames';
import { zeroTimeFletchables } from '../../../lib/skilling/skills/fletching/fletchables';
import Arrows from '../../../lib/skilling/skills/fletching/fletchables/arrows';
import Bolts from '../../../lib/skilling/skills/fletching/fletchables/bolts';
import Darts from '../../../lib/skilling/skills/fletching/fletchables/darts';
import { AmethystBroadBolts, BroadArrows, BroadBolts } from '../../../lib/skilling/skills/fletching/fletchables/slayer';
import TippedBolts from '../../../lib/skilling/skills/fletching/fletchables/tippedBolts';
import TippedDragonBolts from '../../../lib/skilling/skills/fletching/fletchables/tippedDragonBolts';
import type { SlayerTaskUnlocksEnum } from '../../../lib/slayer/slayerUnlocks';
import { hasSlayerUnlock } from '../../../lib/slayer/slayerUtil';
import type { SepulchreActivityTaskOptions } from '../../../lib/types/minions';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { userHasGracefulEquipped } from '../../mahojiSettings';

export async function sepulchreCommand(user: MUser, channelID: string, fletching?: string) {
	const skills = user.skillsAsLevels;
	const agilityLevel = skills.agility;
	const thievingLevel = skills.thieving;
	const minLevel = sepulchreFloors[0].agilityLevel;

	if (agilityLevel < minLevel) {
		return `You need at least level ${minLevel} Agility to do the Hallowed Sepulchre.`;
	}

	if (thievingLevel < 66) {
		return 'You need at least level 66 Thieving to do the Hallowed Sepulchre.';
	}

	if (!userHasGracefulEquipped(user)) {
		return 'You need Graceful equipped in your Skilling setup to do the Hallowed Sepulchre.';
	}

	let fletchingQuantity = 0;
	const fletchable = fletching ? zeroTimeFletchables.find(item => stringMatches(item.name, fletching)) : null;
	if (fletching && !fletchable) return 'That is not a valid item to fletch during Sepulchre.';

	const completableFloors = sepulchreFloors.filter(floor => agilityLevel >= floor.agilityLevel);
	let lapLength = sumArr(completableFloors.map(floor => floor.time));

	// Calculate and apply boosts
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

	const maxLaps = Math.floor(Time.Hour / lapLength);
	const tripLength = maxLaps * lapLength;

	let itemsNeeded: Bank | undefined;
	let sets = 'x';
	let timeToFletchSingleItem = 0;

	if (fletchable) {
		if (fletchable.outputMultiple) {
			sets = ' sets of';
		}
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

		const fletchableTypes = [
			{
				types: [Darts, Bolts, TippedBolts, TippedDragonBolts, BroadBolts, AmethystBroadBolts],
				time: Time.Second * 0.2
			},
			{ types: [Arrows, BroadArrows], time: Time.Second * 0.36 }
		];

		for (const { types, time } of fletchableTypes) {
			if (types.includes(fletchable)) {
				timeToFletchSingleItem = time;
				break;
			}
		}

		if (timeToFletchSingleItem === 0) {
			return 'Error selecting fletchable.';
		}

		fletchingQuantity = Math.floor(tripLength / timeToFletchSingleItem);
		const max = user.bank.fits(fletchable.inputItems);
		if (max < fletchingQuantity && max !== 0) fletchingQuantity = max;

		itemsNeeded = fletchable.inputItems.clone().multiply(fletchingQuantity);
		if (!user.bank.has(itemsNeeded.bank)) {
			return `You don't have enough items. For ${fletchingQuantity}x ${fletchable.name}, you're missing **${itemsNeeded
				.clone()
				.remove(user.bank)}**.`;
		}

		await user.removeItemsFromBank(itemsNeeded);
	}

	await addSubTaskToActivityTask<SepulchreActivityTaskOptions>({
		floors: completableFloors.map(fl => fl.number),
		quantity: maxLaps,
		userID: user.id,
		duration: tripLength,
		type: 'Sepulchre',
		channelID: channelID.toString(),
		minigameID: 'sepulchre',
		fletch: fletchable ? { fletchable, fletchingQuantity } : undefined
	});

	let str = `${user.minionName} is now doing ${maxLaps} laps of the Sepulchre, in each lap they are doing floors ${
		completableFloors[0].number
	}-${completableFloors[completableFloors.length - 1].number}, the trip will take ${formatDuration(
		tripLength
	)}, with each lap taking ${formatDuration(lapLength)}.`;

	if (fletchingQuantity > 0) {
		str += `\nYou are also now Fletching ${fletchingQuantity}${sets} ${fletchable?.name}. Removed ${itemsNeeded} from your bank.`;
	}

	if (boosts.length > 0) {
		str += `\n\n**Boosts:** ${boosts.join(', ')}.`;
	}

	return str;
}
