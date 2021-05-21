import { calcWhatPercent } from 'e';
import { KlasaUser } from 'klasa';

import { NIGHTMARES_HP, ZAM_HASTA_CRUSH } from '../constants';
import { maxOtherStats } from '../gear';
import { NightmareMonster } from '../minions/data/killableMonsters';
import { UserSettings } from '../settings/types/UserSettings';

export function getNightmareGearStats(
	user: KlasaUser,
	team: string[]
): [
	{
		chanceOfDeath: number;
		damageDone: number;
		percentMeleeStrength: number;
		totalGearPercent: number;
		percentWeaponAttackCrush: number;
		attackCrushStat: number;
		kc: number;
	},
	string
] {
	const kc = user.settings.get(UserSettings.MonsterScores)[NightmareMonster.id] ?? 1;
	const gear = user.getGear('melee');
	const weapon = gear.equippedWeapon();
	const gearStats = gear.stats;
	const percentMeleeStrength = calcWhatPercent(
		gearStats.melee_strength,
		maxOtherStats.melee_strength
	);
	const attackCrushStat = weapon?.equipment?.attack_crush ?? 0;
	const percentWeaponAttackCrush = Math.min(calcWhatPercent(attackCrushStat, 95), 100);
	const totalGearPercent = Math.min((percentMeleeStrength + percentWeaponAttackCrush) / 2, 100);

	let percentChanceOfDeath = Math.floor(100 - (Math.log(kc) / Math.log(Math.sqrt(15))) * 50);

	// If they have 50% best gear, -25% chance of death.
	percentChanceOfDeath = Math.floor(percentChanceOfDeath - totalGearPercent / 2);

	// Chance of death cannot be over 90% or <2%.
	percentChanceOfDeath = Math.max(Math.min(percentChanceOfDeath, 90), 5);

	// Damage done starts off as being HP divided by user size.
	let damageDone = NIGHTMARES_HP / team.length;

	// Half it, to use a low damage amount as the base.
	damageDone /= 2;

	// If they have the BIS weapon, their damage is doubled.
	// e.g. 75% of of the best = 1.5x damage done.
	damageDone *= percentWeaponAttackCrush / 50;

	// Heavily punish them for having a weaker crush weapon than a zammy hasta.
	if (attackCrushStat < ZAM_HASTA_CRUSH) {
		damageDone /= 1.5;
	}

	// 20% less damage for very low KC
	if (kc < 10) {
		damageDone *= 0.8;
	}

	const debugString = `\n**${user.username}:** DamageDone[${Math.floor(
		damageDone
	)}HP] DeathChance[${Math.floor(percentChanceOfDeath)}%] WeaponStrength[${Math.floor(
		percentWeaponAttackCrush
	)}%] GearStrength[${Math.floor(percentMeleeStrength)}%] TotalGear[${totalGearPercent}%]\n`;

	return [
		{
			chanceOfDeath: percentChanceOfDeath,
			damageDone,
			percentMeleeStrength,
			totalGearPercent,
			percentWeaponAttackCrush,
			attackCrushStat,
			kc
		},
		debugString
	];
}
