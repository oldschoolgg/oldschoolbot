import { User } from '@prisma/client';
import { percentChance, Time } from 'e';

import { calcMaxTripLength } from '../../util/calcMaxTripLength';
import { userHasItemsEquippedAnywhere } from '../../util/minionUtils';
import { Ore } from './../types';

export function determineMiningTime(
	quantity: number | undefined,
	user: User,
	ore: Ore,
	ticksBetweenRolls: number,
	glovesRate: number,
	armourEffect: number,
	miningCapeEffect: number,
	powermining: boolean,
	goldSilverBoost: boolean,
	lvl: number
): [number, number] {
	let { intercept } = ore;
	if (ore.id === 1625 && userHasItemsEquippedAnywhere(user, 'Amulet of glory')) {
		intercept *= 3;
	}
	let timeElapsed = 0;

	const bankTime = goldSilverBoost ? ore.bankingTime / 3.3 : ore.bankingTime;
	const chanceOfSuccess = ore.slope * lvl + intercept;
	const respawnTimeOrPick = ticksBetweenRolls > ore.respawnTime ? ticksBetweenRolls : ore.respawnTime;

	let newQuantity = 0;

	const userMaxTripTicks = calcMaxTripLength(user, 'Mining') / (Time.Second * 0.6);

	while (timeElapsed < userMaxTripTicks) {
		while (!percentChance(chanceOfSuccess)) {
			timeElapsed += ticksBetweenRolls;
		}
		if (!percentChance(glovesRate)) {
			timeElapsed += respawnTimeOrPick;
		}
		newQuantity++;
		if (percentChance(miningCapeEffect)) {
			newQuantity++;
		}
		if (percentChance(armourEffect)) {
			newQuantity++;
		}
		// Add 28th of banking time every quantity
		if (!powermining) {
			timeElapsed += bankTime / 28;
		}
		if (quantity && newQuantity >= quantity) {
			break;
		}
	}
	return [timeElapsed * 0.6 * Time.Second, newQuantity];
}
