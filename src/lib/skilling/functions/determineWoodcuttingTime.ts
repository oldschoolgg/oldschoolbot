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
	disable_1_5t?: boolean;
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
	disable_1_5t = false,
	woodcuttingLvl,
	maxTripLength,
	rng
}: WoodcuttingTimeOptions): [number, number] {
	let timeElapsed = 0;

	const bankTime = log.bankingTime;
	const farmingLvl = user.skillsAsLevels.farming;
	const chanceOfSuccess = (log.slope * woodcuttingLvl + log.intercept) * axeMultiplier;
	const { findNewTreeTime } = log;
	const isHardwood = [EItem.TEAK_LOGS, EItem.MAHOGANY_LOGS].includes(log.id);

	let teakTick = false;
	if (!forestry && !disable_1_5t && isHardwood) {
		if (log.id === EItem.TEAK_LOGS && farmingLvl >= 35) {
			teakTick = true;
		}
		if (log.id === EItem.MAHOGANY_LOGS && farmingLvl >= 55) {
			teakTick = true;
		}
	}
	const chopTickTime = isHardwood ? (teakTick ? 1.5 : 2) : 4;
	const newTreeTickTime = teakTick ? 1.5 : findNewTreeTime;

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
			timeElapsed += chopTickTime;
		}
		// Delay for depleting a tree
		if (rng.percentChance(log.depletionChance)) {
			timeElapsed += newTreeTickTime;
		} else {
			timeElapsed += chopTickTime;
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
