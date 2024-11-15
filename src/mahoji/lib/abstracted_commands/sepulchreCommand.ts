import { Time, reduceNumByPercent, sumArr } from 'e';

import { formatDuration } from '@oldschoolgg/toolkit/util';
import { sepulchreBoosts, sepulchreFloors } from '../../../lib/minions/data/sepulchre';
import { getMinigameScore } from '../../../lib/settings/minigames';
import type { SepulchreActivityTaskOptions } from '../../../lib/types/minions';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import { userHasGracefulEquipped } from '../../mahojiSettings';

export async function sepulchreCommand(user: MUser, channelID: string) {
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
	const maxLaps = Math.floor(calcMaxTripLength(user, 'Sepulchre') / lapLength);
	const tripLength = maxLaps * lapLength;

	await addSubTaskToActivityTask<SepulchreActivityTaskOptions>({
		floors: completableFloors.map(fl => fl.number),
		quantity: maxLaps,
		userID: user.id,
		duration: tripLength,
		type: 'Sepulchre',
		channelID: channelID.toString(),
		minigameID: 'sepulchre'
	});

	let str = `${user.minionName} is now doing ${maxLaps} laps of the Sepulchre, in each lap they are doing floors ${
		completableFloors[0].number
	}-${completableFloors[completableFloors.length - 1].number}, the trip will take ${formatDuration(
		tripLength
	)}, with each lap taking ${formatDuration(lapLength)}.`;

	if (boosts.length > 0) {
		str += `\n\n**Boosts:** ${boosts.join(', ')}.`;
	}

	return str;
}
