import { Time, percentChance } from 'e';

import type { GearBank } from '../../structures/GearBank';
import type { Ore } from './../types';

interface MiningTimeOptions {
	quantity: number | undefined;
	ore: Ore;
	ticksBetweenRolls: number;
	glovesEffect: number;
	armourEffect: number;
	miningCapeEffect: number;
	powermining: boolean;
	goldSilverBoost: boolean;
	miningLvl: number;
	passedDuration?: number;
	maxTripLength: number;
	gearBank: GearBank;
}

export function determineMiningTime({
	quantity,
	ore,
	ticksBetweenRolls,
	glovesEffect,
	armourEffect,
	miningCapeEffect,
	powermining,
	goldSilverBoost,
	miningLvl,
	passedDuration,
	maxTripLength,
	gearBank
}: MiningTimeOptions): [number, number] {
	let { intercept } = ore;
	if (ore.name === 'Gem rock' && gearBank.hasEquipped('Amulet of glory')) {
		intercept *= 3;
	}
	let timeElapsed = 0;

	const bankTime = goldSilverBoost ? ore.bankingTime / 3.3 : ore.bankingTime;
	const chanceOfSuccess = ore.slope * miningLvl + intercept;
	const respawnTimeOrPick = ticksBetweenRolls > ore.respawnTime ? ticksBetweenRolls : ore.respawnTime;

	let newQuantity = 0;

	if (!passedDuration) {
		passedDuration = 0;
	}

	let userMaxTripTicks = (maxTripLength - passedDuration) / (Time.Second * 0.6);

	if (ore.name === 'Amethyst' || ore.name === 'Daeyalt essence rock') {
		userMaxTripTicks *= 1.5;
	}

	let remainingNoDeplete = glovesEffect;

	while (timeElapsed < userMaxTripTicks) {
		while (!percentChance(chanceOfSuccess)) {
			timeElapsed += ticksBetweenRolls;
		}
		if (remainingNoDeplete <= 0) {
			timeElapsed += respawnTimeOrPick;
			remainingNoDeplete = glovesEffect;
		} else {
			timeElapsed += ticksBetweenRolls;
			remainingNoDeplete--;
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
