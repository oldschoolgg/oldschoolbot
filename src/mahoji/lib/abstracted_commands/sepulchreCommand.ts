import { objectEntries, reduceNumByPercent, Time } from 'e';
import { KlasaUser } from 'klasa';
import { SkillsEnum } from 'oldschooljs/dist/constants';
import { addArrayOfNumbers } from 'oldschooljs/dist/util';

import { sepulchreBoosts, sepulchreFloors } from '../../../lib/minions/data/sepulchre';
import { SepulchreActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration, itemNameFromID } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';

export async function sepulchreCommand(user: KlasaUser, channelID: bigint) {
	const agilityLevel = user.skillLevel(SkillsEnum.Agility);
	const thievingLevel = user.skillLevel(SkillsEnum.Thieving);
	const minLevel = sepulchreFloors[0].agilityLevel;
	if (agilityLevel < minLevel) {
		return `You need atleast level ${minLevel} Agility to do the Hallowed Sepulchre.`;
	}

	if (thievingLevel < 66) {
		return 'You need atleast level 66 Thieving to do the Hallowed Sepulchre.';
	}

	if (!user.hasGracefulEquipped()) {
		return 'You need Graceful equipped in your Skilling setup to do the Hallowed Sepulchre.';
	}

	const completableFloors = sepulchreFloors.filter(floor => agilityLevel >= floor.agilityLevel);
	let lapLength = addArrayOfNumbers(completableFloors.map(floor => floor.time));

	const boosts = [];

	// Every 1h becomes 1% faster to a cap of 10%
	const percentReduced = Math.min(
		Math.floor((await user.getMinigameScore('sepulchre')) / (Time.Hour / lapLength)),
		10
	);

	boosts.push(`${percentReduced.toFixed(1)}% for minion learning`);

	lapLength = reduceNumByPercent(lapLength, percentReduced);

	const hasCob = user.usingPet('Cob');

	if (hasCob) {
		lapLength /= 2;
		boosts.push("2x boost with Cob's help");
	}

	for (const [id, percent] of objectEntries(sepulchreBoosts)) {
		if (user.hasItemEquippedOrInBank(Number(id))) {
			boosts.push(`${percent}% for ${itemNameFromID(Number(id))}`);
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
