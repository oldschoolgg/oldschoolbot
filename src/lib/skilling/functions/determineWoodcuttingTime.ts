import { percentChance, Time } from 'e';

import { IVY_MAX_TRIP_LENGTH_BOOST } from '../../constants';
import { calcMaxTripLength } from '../../util/calcMaxTripLength';
import { MUserClass } from './../../MUser';
import { Log } from './../types';

interface WoodcuttingTimeOptions {
	quantity: number | undefined;
	user: MUserClass;
	log: Log;
	axeMultiplier: number;
	powerchopping: boolean;
	woodcuttingLvl: number;
}

export function determineWoodcuttingTime({
	quantity,
	user,
	log,
	axeMultiplier,
	powerchopping,
	woodcuttingLvl
}: WoodcuttingTimeOptions): [number, number] {
	let timeElapsed = 0;

	const bankTime = log.bankingTime;
	const chanceOfSuccess = (log.slope * woodcuttingLvl + log.intercept) * axeMultiplier;
	const { findNewTreeTime } = log;

	let teakTick = false;
	if (user.skillsAsLevels.woodcutting >= 92 && (log.name === 'Teak Logs' || log.name === 'Mahogany Logs')) {
		teakTick = true;
	}

	let newQuantity = 0;

	let maxTripLength = calcMaxTripLength(user, 'Woodcutting');
	if (!powerchopping && user.hasEquippedOrInBank('Log basket')) {
		maxTripLength += Time.Minute * 5;
	}
	let userMaxTripTicks = maxTripLength / (Time.Second * 0.6);

	if (log.name === 'Redwood Logs') {
		userMaxTripTicks *= 2;
	}

	if (log.name === 'Ivy') userMaxTripTicks += IVY_MAX_TRIP_LENGTH_BOOST / (Time.Second * 0.6);

	while (timeElapsed < userMaxTripTicks) {
		// Keep rolling until log chopped
		while (!percentChance(chanceOfSuccess)) {
			timeElapsed += teakTick ? 1.5 : 4;
		}
		// Delay for depleting a tree
		if (percentChance(log.depletionChance)) {
			timeElapsed += findNewTreeTime;
		} else {
			timeElapsed += teakTick ? 1.5 : 4;
		}
		newQuantity++;

		// Add banking time every 28th quantity
		if (!powerchopping) {
			timeElapsed += bankTime / 28;
		}
		if (quantity && newQuantity >= quantity) {
			break;
		}
	}
	return [timeElapsed * 0.6 * Time.Second, newQuantity];
}
