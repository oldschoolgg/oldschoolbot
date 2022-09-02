import { User } from '@prisma/client';
import { percentChance, Time } from 'e';

import { getSkillsOfMahojiUser } from '../../util';
import { calcMaxTripLength } from '../../util/calcMaxTripLength';
import { Log } from './../types';

interface WoodcuttingTimeOptions {
	quantity: number | undefined;
	user: User;
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
	const intercept = log.intercept * axeMultiplier;
	const slope = log.slope * axeMultiplier;

	let timeElapsed = 0;

	const bankTime = log.bankingTime;
	const chanceOfSuccess = slope * woodcuttingLvl + intercept;
	const { findNewTreeTime } = log;

	let teakTick = false;
	if (getSkillsOfMahojiUser(user, true).woodcutting >= 92 && log.name === 'Teak Logs') {
		teakTick = true;
	}

	let newQuantity = 0;

	const userMaxTripTicks = calcMaxTripLength(user, 'Woodcutting') / (Time.Second * 0.6);

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
