import { User } from '@prisma/client';
import { percentChance, Time } from 'e';
import { Bank } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';

import { getSkillsOfMahojiUser } from '../../util';
import { calcMaxTripLength } from '../../util/calcMaxTripLength';
import { userHasItemsEquippedAnywhere } from '../../util/minionUtils';
import { Ore } from './../types';

interface MiningTimeOptions {
	quantity: number | undefined;
	user: User;
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
	if (ore.name === 'Gem rock' && userHasItemsEquippedAnywhere(user, 'Amulet of glory')) {
		intercept *= 3;
	}

	// Check for 100 golden nuggets and 72 mining for upper motherlode mine access.
	const skills = getSkillsOfMahojiUser(user, true);
	const cl = new Bank(user.collectionLogBank as ItemBank);
	const gotNuggets = cl.amount('Golden nugget') >= 100;
	if (ore.name === 'Motherlode mine') {
		if (gotNuggets && skills.mining >= 72) {
			ore.respawnTime = 4;
			ore.bankingTime = 40;
		}
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
