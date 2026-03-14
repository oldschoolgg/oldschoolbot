import { Time } from '@oldschoolgg/toolkit';

import { isHardwoodOnePointFiveTick } from '@/lib/skilling/functions/isHardwoodOnePointFiveTick.js';
import type { Log } from '@/lib/skilling/types.js';

interface WoodcuttingTimeOptions {
	quantity: number | undefined;
	user: MUser;
	log: Log;
	axeMultiplier: number;
	powerchopping: boolean;
	forestry: boolean;
	woodcuttingLvl: number;
	maxTripLength: number;
	rng: RNGProvider;
}

export function determineWoodcuttingTime({
	quantity,
	user,
	log,
	axeMultiplier,
	powerchopping,
	forestry,
	woodcuttingLvl,
	maxTripLength,
	rng
}: WoodcuttingTimeOptions): [number, number] {
	let timeElapsed = 0;

	const bankTime = log.bankingTime;
	const farmingLvl = user.skillsAsLevels.farming;
	const chanceOfSuccess = (log.slope * woodcuttingLvl + log.intercept) * axeMultiplier;
	const { findNewTreeTime } = log;
	const hardwoodOnePointFiveTick = isHardwoodOnePointFiveTick({
		logID: log.id,
		woodcuttingLevel: woodcuttingLvl,
		farmingLevel: farmingLvl,
		forestry
	});

	let newQuantity = 0;

	if (!powerchopping && user.hasEquippedOrInBank('Log basket')) {
		maxTripLength += Time.Minute * 5;
	}
	let userMaxTripTicks = maxTripLength / (Time.Second * 0.6);

	if (log.name === 'Redwood Logs') {
		userMaxTripTicks *= 2;
	}

	while (timeElapsed < userMaxTripTicks) {
		// Keep rolling until log chopped
		while (!rng.percentChance(chanceOfSuccess)) {
			timeElapsed += hardwoodOnePointFiveTick ? 1.5 : 4;
		}
		// Delay for depleting a tree
		if (rng.percentChance(log.depletionChance)) {
			timeElapsed += findNewTreeTime;
		} else {
			timeElapsed += hardwoodOnePointFiveTick ? 1.5 : 4;
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
