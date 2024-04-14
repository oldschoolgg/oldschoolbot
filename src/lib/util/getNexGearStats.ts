import { calcWhatPercent, randInt } from 'e';
import { itemID } from 'oldschooljs/dist/util';

import { maxOffenceStats } from '../gear';
import { GearStats } from '../gear/types';
import { NexMonster } from '../nex';

export async function getNexGearStats(
	user: MUser,
	team: string[]
): Promise<
	[
		{
			chanceOfDeath: number;
			damageDone: number;
			percentRangeStrength: number;
			totalGearPercent: number;
			percentWeaponAttackRanged: number;
			attackRangedStat: number;
			kc: number;
			gearStats: GearStats;
		},
		string
	]
> {
	const kc = await user.getKC(NexMonster.id);
	const gear = user.gear.range;
	const weapon = gear.equippedWeapon();
	const gearStats = gear.stats;
	const percentRangeStrength = calcWhatPercent(
		gearStats.attack_ranged + gearStats.ranged_strength,
		maxOffenceStats.attack_ranged + gearStats.ranged_strength
	);
	const attackRangedStat = weapon?.equipment?.attack_ranged ?? 0;
	const percentWeaponAttackRanged = Math.min(calcWhatPercent(attackRangedStat, 95), 100);
	const totalGearPercent = Math.min((percentRangeStrength + percentWeaponAttackRanged) / 2, 100);

	let percentChanceOfDeath = Math.floor(100 - (Math.log(kc) / Math.log(Math.sqrt(15))) * 50);

	// If they have 50% best gear, -25% chance of death.
	percentChanceOfDeath = Math.floor(percentChanceOfDeath - totalGearPercent / 2);

	// Chance of death cannot be over 90% or <2%.
	percentChanceOfDeath = Math.max(Math.min(percentChanceOfDeath, 100), 5);

	// Damage done starts off as being HP divided by user size.
	let damageDone = 6000 / team.length;

	// Half it, to use a low damage amount as the base.
	damageDone /= 1.5;

	// If they have the BIS weapon, their damage is doubled.
	// e.g. 75% of of the best = 1.5x damage done.
	damageDone *= percentWeaponAttackRanged / 80;

	if (weapon?.id === itemID('Twisted bow')) {
		damageDone *= 1.1;
	}

	// Heavily punish them for having a weaker crush weapon than a zammy hasta.
	if (attackRangedStat < 69) {
		damageDone /= 1.5;
	}

	if (kc < 2) {
		percentChanceOfDeath = randInt(50, 70);
	} else if (kc < 5) {
		percentChanceOfDeath = randInt(30, 50);
	} else if (kc < 10) {
		percentChanceOfDeath = randInt(20, 40);
	} else if (kc < 20) {
		percentChanceOfDeath = randInt(10, 30);
	} else {
		percentChanceOfDeath = randInt(1, 4);
	}

	const debugString = `\n**${user.usernameOrMention}:** DamageDone[${Math.floor(
		damageDone
	)}HP] DeathChance[${Math.floor(percentChanceOfDeath)}%] WeaponStrength[${Math.floor(
		percentWeaponAttackRanged
	)}%] GearStrength[${Math.floor(percentRangeStrength)}%] TotalGear[${totalGearPercent}%]\n`;

	return [
		{
			chanceOfDeath: percentChanceOfDeath,
			damageDone,
			percentRangeStrength,
			totalGearPercent,
			percentWeaponAttackRanged,
			attackRangedStat,
			kc,
			gearStats
		},
		debugString
	];
}
