import { Time, reduceNumByPercent, sumArr } from 'e';

import { formatDuration, stringMatches } from '@oldschoolgg/toolkit';
import type { Bank } from 'oldschooljs';
import { sepulchreBoosts, sepulchreFloors } from '../../../lib/minions/data/sepulchre';
import { getMinigameScore } from '../../../lib/settings/minigames';
import { zeroTimeFletchables } from '../../../lib/skilling/skills/fletching/fletchables';
import Arrows from '../../../lib/skilling/skills/fletching/fletchables/arrows';
import Bolts from '../../../lib/skilling/skills/fletching/fletchables/bolts';
import Darts from '../../../lib/skilling/skills/fletching/fletchables/darts';
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

	console.log(fletching);

	if (agilityLevel < minLevel) {
		return `You need atleast level ${minLevel} Agility to do the Hallowed Sepulchre.`;
	}

	if (thievingLevel < 66) {
		return 'You need atleast level 66 Thieving to do the Hallowed Sepulchre.';
	}

	if (!userHasGracefulEquipped(user)) {
		return 'You need Graceful equipped in your Skilling setup to do the Hallowed Sepulchre.';
	}

	const fletchable = zeroTimeFletchables.find(item => stringMatches(item.name, fletching));
	if (fletching && !fletchable) return 'That is not a valid item to fletch during Sepulchre.';
	const dart = Darts.find(item => stringMatches(item.name, fletching));
	const bolt = Bolts.find(item => stringMatches(item.name, fletching));
	const arrow = Arrows.find(item => stringMatches(item.name, fletching));
	const tippedBolt = TippedBolts.find(item => stringMatches(item.name, fletching));
	const tippedDragonBolt = TippedDragonBolts.find(item => stringMatches(item.name, fletching));

	let fletchingQuantity = 0;
	const userBank = user.bank;

	const completableFloors = sepulchreFloors.filter(floor => agilityLevel >= floor.agilityLevel);
	let lapLength = sumArr(completableFloors.map(floor => floor.time));

	const boosts = [];

	// Every 1h becomes 1% faster to a cap of 10%
	const percentReduced = Math.min(
		Math.floor((await getMinigameScore(user.id, 'sepulchre')) / (Time.Hour / lapLength)),
		10
	);

	boosts.push(`${percentReduced.toFixed(1)}% for minion learning`);

	lapLength = reduceNumByPercent(lapLength, percentReduced);

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
		if (fletchable?.outputMultiple) {
			sets = ' sets of';
		}

		if (user.skillLevel('fletching') < fletchable.level) {
			return `${user.minionName} needs ${fletchable.level} Fletching to fletch ${fletchable.name}.`;
		}

		if (fletchable.requiredSlayerUnlocks) {
			const mySlayerUnlocks = user.user.slayer_unlocks;

			const { success, errors } = hasSlayerUnlock(
				mySlayerUnlocks as SlayerTaskUnlocksEnum[],
				fletchable.requiredSlayerUnlocks
			);
			if (!success) {
				return `You don't have the required Slayer Unlocks to create this item.\n\nRequired: ${errors}`;
			}
		}
		if (dart || bolt || tippedDragonBolt || tippedBolt) timeToFletchSingleItem = Time.Second * 0.2;
		if (arrow) timeToFletchSingleItem = Time.Second * 0.36;

		if (timeToFletchSingleItem === 0) return 'Error selecting fletchable.';

		fletchingQuantity = Math.floor(tripLength / timeToFletchSingleItem);
		const max = userBank.fits(fletchable.inputItems);
		if (max < fletchingQuantity && max !== 0) fletchingQuantity = max;

		itemsNeeded = fletchable.inputItems.clone().multiply(fletchingQuantity);
		if (!userBank.has(itemsNeeded.bank)) {
			return `You don't have enough items. For ${fletchingQuantity}x ${fletchable.name}, you're missing **${itemsNeeded
				.clone()
				.remove(userBank)}**.`;
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
		fletch: fletchable
			? {
					fletchable,
					fletchingQuantity
				}
			: undefined
	});
	let str = `${user.minionName} is now doing ${maxLaps} laps of the Sepulchre, in each lap they are doing floors ${
		completableFloors[0].number
	}-${completableFloors[completableFloors.length - 1].number}, the trip will take ${formatDuration(
		tripLength
	)}, with each lap taking ${formatDuration(lapLength)}.`;

	if (fletchingQuantity > 0) {
		str += `\nYou are also now Fletching ${fletchingQuantity}${sets} ${
			fletchable?.name
		}. Removed ${itemsNeeded} from your bank.`;
	}

	if (boosts.length > 0) {
		str += `\n\n**Boosts:** ${boosts.join(', ')}.`;
	}

	return str;
}
