import { IVY_MAX_TRIP_LENGTH_BOOST } from '@/lib/bso/bsoConstants.js';

import { percentChance } from '@oldschoolgg/rng';
import { Time } from '@oldschoolgg/toolkit';
import { EItem } from 'oldschooljs/EItem';

import type { Log } from '@/lib/skilling/types.js';

interface WoodcuttingTimeOptions {
	quantity: number | undefined;
	user: MUser;
	log: Log;
	axeMultiplier: number;
	powerchopping: boolean;
	forestry: boolean;
	woodcuttingLvl: number;
}

export function determineWoodcuttingTime({
	quantity,
	user,
	log,
	axeMultiplier,
	powerchopping,
	forestry,
	woodcuttingLvl
}: WoodcuttingTimeOptions): [number, number] {
	let timeElapsed = 0;

	const bankTime = log.bankingTime;
	const farmingLvl = user.skillsAsLevels.farming;
	const chanceOfSuccess = (log.slope * woodcuttingLvl + log.intercept) * axeMultiplier;
	const { findNewTreeTime } = log;

	let teakTick = false;
	if (!forestry && woodcuttingLvl >= 92) {
		if (log.id === EItem.TEAK_LOGS && farmingLvl >= 35) {
			teakTick = true;
		}
		if (log.id === EItem.MAHOGANY_LOGS && farmingLvl >= 55) {
			teakTick = true;
		}
	}

	let newQuantity = 0;

	let maxTripLength = user.calcMaxTripLength('Woodcutting');
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
