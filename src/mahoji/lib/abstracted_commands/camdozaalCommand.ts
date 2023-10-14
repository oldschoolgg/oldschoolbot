import { Time } from 'e';
import { SkillsEnum } from 'oldschooljs/dist/constants';
import { randomVariation } from 'oldschooljs/dist/util';

import { ActivityTaskOptionsWithQuantity } from '../../../lib/types/minions';
import { formatDuration } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';

async function miningCommand(user: MUser, channelID: string, quantity: number | undefined) {
	if (user.skillLevel(SkillsEnum.Fishing) < 7) {
		return 'You need at least level 7 Fishing to fish in the Ruins of Camdozaal';
	}

	const maxTripLength = calcMaxTripLength(user, 'CamdozaalFishing');
	const timePerFish = randomVariation(2.5, 4) * Time.Second;
	if (!quantity) {
		quantity = Math.floor(maxTripLength / timePerFish);
	}
	const duration = timePerFish * quantity;

	await addSubTaskToActivityTask<ActivityTaskOptionsWithQuantity>({
		userID: user.id,
		channelID: channelID.toString(),
		quantity,
		duration,
		type: 'CamdozaalFishing'
	});

	return `${user.minionName} is now fishing in the Ruins of Camdozaal, it will take around ${formatDuration(
		duration
	)} to finish.`;
}

async function smithingCommand(user: MUser, channelID: string, quantity: number | undefined) {
	if (user.skillLevel(SkillsEnum.Fishing) < 7) {
		return 'You need at least level 7 Fishing to fish in the Ruins of Camdozaal';
	}

	const maxTripLength = calcMaxTripLength(user, 'CamdozaalFishing');
	const timePerFish = randomVariation(2.5, 4) * Time.Second;
	if (!quantity) {
		quantity = Math.floor(maxTripLength / timePerFish);
	}
	const duration = timePerFish * quantity;

	await addSubTaskToActivityTask<ActivityTaskOptionsWithQuantity>({
		userID: user.id,
		channelID: channelID.toString(),
		quantity,
		duration,
		type: 'CamdozaalFishing'
	});

	return `${user.minionName} is now fishing in the Ruins of Camdozaal, it will take around ${formatDuration(
		duration
	)} to finish.`;
}

async function fishingCommand(user: MUser, channelID: string, quantity: number | undefined) {
	if (user.skillLevel(SkillsEnum.Fishing) < 7) {
		return 'You need at least level 7 Fishing to fish in the Ruins of Camdozaal';
	}

	const maxTripLength = calcMaxTripLength(user, 'CamdozaalFishing');
	const timePerFish = randomVariation(2.5, 4) * Time.Second;
	if (!quantity) {
		quantity = Math.floor(maxTripLength / timePerFish);
	}
	const duration = timePerFish * quantity;

	await addSubTaskToActivityTask<ActivityTaskOptionsWithQuantity>({
		userID: user.id,
		channelID: channelID.toString(),
		quantity,
		duration,
		type: 'CamdozaalFishing'
	});

	return `${user.minionName} is now fishing in the Ruins of Camdozaal, it will take around ${formatDuration(
		duration
	)} to finish.`;
}
export async function camdozaalCommand(user: MUser, channelID: string, choice: string, quantity: number | undefined) {
	const qp = user.QP;
	if (qp <= 16) {
		return "You haven't completed enough quests to enter the Ruins of Camdozaal, Return when you have at least 17 quest points.";
	}
	if (choice === 'mining') {
		return miningCommand(user, channelID, quantity);
	}
	if (choice === 'smithing') {
		return smithingCommand(user, channelID, quantity);
	}
	return fishingCommand(user, channelID, quantity);
}
