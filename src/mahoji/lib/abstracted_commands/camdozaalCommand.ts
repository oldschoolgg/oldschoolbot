import { Time } from 'e';
import { Bank } from 'oldschooljs';
import { SkillsEnum } from 'oldschooljs/dist/constants';

import { ActivityTaskOptionsWithQuantity } from '../../../lib/types/minions';
import { formatDuration } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';

async function miningCommand(user: MUser, channelID: string, quantity: number | undefined) {
	if (user.skillLevel(SkillsEnum.Mining) < 14) {
		return 'You need at least level 14 Mining to fish in the Ruins of Camdozaal.';
	}

	const maxTripLength = calcMaxTripLength(user, 'CamdozaalMining');
	const timePerMine = 4.5 * Time.Second;
	if (!quantity) {
		quantity = Math.floor(maxTripLength / timePerMine);
	}
	const duration = timePerMine * quantity;

	if (duration > maxTripLength) {
		return `${user.minionName} can't go on trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest amount of Barronite rocks you can mine is ${Math.floor(
			maxTripLength / timePerMine
		)}.`;
	}

	await addSubTaskToActivityTask<ActivityTaskOptionsWithQuantity>({
		userID: user.id,
		channelID: channelID.toString(),
		quantity,
		duration,
		type: 'CamdozaalMining'
	});

	return `${user.minionName} is now mining in the Ruins of Camdozaal, it will take around ${formatDuration(
		duration
	)} to finish.`;
}

async function smithingCommand(user: MUser, channelID: string, quantity: number | undefined) {
	if (user.skillLevel(SkillsEnum.Smithing) < 14) {
		return 'You need at least level 14 Smithing to smith in the Ruins of Camdozaal';
	}

	const maxTripLength = calcMaxTripLength(user, 'CamdozaalSmithing');
	const timePerSmith = 3.5 * Time.Second;
	if (!quantity) {
		quantity = Math.floor(maxTripLength / timePerSmith);
	}
	const duration = timePerSmith * quantity;

	if (user.bank.amount('Barronite deposit') < quantity) {
		return "You don't have enough Barronite desposit's to smelt.";
	}

	if (duration > maxTripLength) {
		return `${user.minionName} can't go on trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest amount of Barronite deposits you can smith is ${Math.floor(
			maxTripLength / timePerSmith
		)}.`;
	}

	await user.removeItemsFromBank(new Bank().add('Barronite deposit', quantity));

	await addSubTaskToActivityTask<ActivityTaskOptionsWithQuantity>({
		userID: user.id,
		channelID: channelID.toString(),
		quantity,
		duration,
		type: 'CamdozaalSmithing'
	});

	return `${user.minionName} is now smithing in the Ruins of Camdozaal, it will take around ${formatDuration(
		duration
	)} to finish.`;
}

async function fishingCommand(user: MUser, channelID: string, quantity: number | undefined) {
	if (user.skillLevel(SkillsEnum.Fishing) < 7) {
		return 'You need at least level 7 Fishing to fish in the Ruins of Camdozaal';
	}

	const maxTripLength = calcMaxTripLength(user, 'CamdozaalFishing');
	const timePerFish = 5.5 * Time.Second;
	if (!quantity) {
		quantity = Math.floor(maxTripLength / timePerFish);
	}
	const duration = timePerFish * quantity;

	if (duration > maxTripLength) {
		return `${user.minionName} can't go on trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest amount of Camdozaal fish you can catch is ${Math.floor(
			maxTripLength / timePerFish
		)}.`;
	}

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
