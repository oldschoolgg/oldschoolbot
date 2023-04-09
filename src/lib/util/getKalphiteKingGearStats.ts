import { calcWhatPercent, randInt } from 'e';

import { maxOffenceStats } from '../gear';
import { GearStats } from '../gear/types';
import { KalphiteKingMonster } from '../minions/data/killableMonsters/custom/bosses/KalphiteKing';

export async function getKalphiteKingGearStats(
	user: MUser,
	team: string[]
): Promise<
	[
		{
			chanceOfDeath: number;
			damageDone: number;
			percentAttackStrength: number;
			totalGearPercent: number;
			percentWeaponAttackCrush: number;
			attackCrushStat: number;
			kc: number;
			gearStats: GearStats;
		},
		string
	]
> {
	const kc = await user.getKC(KalphiteKingMonster.id);
	const gear = user.gear.melee;
	const weapon = gear.equippedWeapon();
	const gearStats = gear.stats;
	const percentAttackStrength = calcWhatPercent(
		gearStats.attack_crush + gearStats.melee_strength,
		maxOffenceStats.attack_crush + gearStats.melee_strength
	);
	const attackCrushStat = weapon?.equipment?.attack_crush ?? 0;
	const percentWeaponAttackCrush = Math.min(calcWhatPercent(attackCrushStat, 95), 100);
	const totalGearPercent = Math.min((attackCrushStat + percentAttackStrength) / 2, 100);

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
	damageDone *= percentWeaponAttackCrush / 80;

	if (gear.hasEquipped('Drygore mace')) {
		damageDone *= 1.1;
	}

	// Heavily punish them for having a weaker crush weapon than a zammy hasta.
	if (percentAttackStrength < 95) {
		damageDone /= 1.5;
	}

	if (kc < 10) {
		percentChanceOfDeath = randInt(10, 15);
	} else {
		percentChanceOfDeath = randInt(1, 4);
	}

	const debugString = `\n**${user.usernameOrMention}:** DamageDone[${Math.floor(
		damageDone
	)}HP] DeathChance[${Math.floor(percentChanceOfDeath)}%] WeaponStrength[${Math.floor(
		percentWeaponAttackCrush
	)}%] GearStrength[${Math.floor(percentAttackStrength)}%] TotalGear[${totalGearPercent}%]\n`;

	return [
		{
			chanceOfDeath: percentChanceOfDeath,
			damageDone,
			percentAttackStrength,
			totalGearPercent,
			percentWeaponAttackCrush,
			attackCrushStat,
			kc,
			gearStats
		},
		debugString
	];
}
