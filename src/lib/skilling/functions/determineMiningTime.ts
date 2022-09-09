import { percentChance, Time } from 'e';

import { calcMaxTripLength } from '../../util/calcMaxTripLength';
import { Ore } from './../types';

interface MiningTimeOptions {
	quantity: number | undefined;
	user: MUser;
	ore: Ore;
	ticksBetweenRolls: number;
	glovesRate: number;
	armourEffect: number;
	miningCapeEffect: number;
	powermining: boolean;
	goldSilverBoost: boolean;
	miningLvl: number;
}

export function determineMiningTime({
	quantity,
	user,
	ore,
	ticksBetweenRolls,
	glovesRate,
	armourEffect,
	miningCapeEffect,
	powermining,
	goldSilverBoost,
	miningLvl
}: MiningTimeOptions): [number, number] {
	let { intercept } = ore;
	if (ore.name === 'Gem rock' && user.hasEquipped('Amulet of glory')) {
		intercept *= 3;
	}
	let timeElapsed = 0;

	const bankTime = goldSilverBoost ? ore.bankingTime / 3.3 : ore.bankingTime;
	const chanceOfSuccess = ore.slope * miningLvl + intercept;
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
