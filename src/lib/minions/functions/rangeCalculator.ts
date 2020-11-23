import { randInt } from 'e';
import { KlasaUser } from 'klasa';
import { Monsters } from 'oldschooljs';

import resolveGearTypeSetting from '../../gear/functions/resolveGearTypeSetting';
import { sumOfSetupStats } from '../../gear/functions/sumOfSetupStats';
import { UserSettings } from '../../settings/types/UserSettings';
import { KillableMonster } from '../types';
import { GearSetupTypes } from './../../gear/types';
import { SkillsEnum } from './../../skilling/types';

export default function rangeCalculator(
	monster: KillableMonster,
	user: KlasaUser,
	quantity: number
) {
	// https://oldschool.runescape.wiki/w/Damage_per_second/Ranged as source.
	const combatStyle = user.settings.get(UserSettings.Minion.RangeCombatStyle);
	const currentMonsterData = Monsters.find(mon => mon.id === monster.id)?.data;
	if (!currentMonsterData) {
		console.log("Monster dosen't exist.");
		return;
	}
	const rangeWeapon = user.equippedWeapon(GearSetupTypes.Range);
	if (rangeWeapon === null || rangeWeapon.weapon === null) {
		console.log('Weapon is null.');
		return;
	}
	const gearStats = sumOfSetupStats(
		user.settings.get(resolveGearTypeSetting(GearSetupTypes.Range))
	);

	// Calculate effective ranged strength
	let effectiveRangeStr =
		Math.round(
			user.skillLevel(SkillsEnum.Ranged) /* + Ranged boost: potions etc) * prayerbonus */
		) + 8;
	let attackStyle = '';
	for (let stance of rangeWeapon.weapon.stances) {
		if (stance.combat_style.toLowerCase() === combatStyle) {
			attackStyle = stance.attack_style;
			break;
		}
	}

	if (attackStyle === 'accurate') {
		effectiveRangeStr += 3;
	}

	/* if wearing full ranged void
    effectiveRangeStr *= 1.1;
    */

	// Calculate max hit
	let maxHit = Math.round((effectiveRangeStr * (gearStats.ranged_strength + 64) + 320) / 640);

	/* if wearing black mask (i) / slayer helm (i) or salve amulet DOSEN'T STACK
    maxHit *= 1.15 or 7/6
    */

	// Calculate effective ranged attack
	let effectiveRangeAttack =
		Math.round(
			user.skillLevel(SkillsEnum.Ranged) /* + Range boost: potions etc) * prayerbonus */
		) + 8;

	if (attackStyle === 'accurate') {
		effectiveRangeAttack += 3;
	}
	if (attackStyle === 'controlled') {
		effectiveRangeAttack += 1;
	}

	/* if wearing full range void
    effectiveRangeAttack *= 1.1;
    */

	// Calculate attack roll
	let attackRoll = effectiveRangeAttack * (gearStats.attack_ranged + 64);

	/* if wearing black mask (i) / slayer helm (i) or salve amulet vs undead monster. DOSEN'T STACK
    attackRoll *= 1.15 or 7/6
    */

	attackRoll = Math.round(attackRoll);

	// Calculate Defence roll
	let defenceRoll = currentMonsterData.defenceLevel + 9;

	defenceRoll *= currentMonsterData.defenceRanged + 64;

	defenceRoll = Math.round(defenceRoll);

	// Calculate hit chance
	let hitChance = 0;

	if (attackRoll > defenceRoll) {
		hitChance = 1 - (defenceRoll + 2) / (2 * attackRoll + 1);
	} else {
		hitChance = attackRoll / (2 * defenceRoll + 1);
	}

	// Calculate average damage per hit and dps
	const DamagePerHit = (maxHit * hitChance) / 2;

	let rangeAttackSpeed =
		combatStyle === 'rapid'
			? rangeWeapon.weapon.attack_speed - 0.6
			: rangeWeapon.weapon.attack_speed;
	const DPS = DamagePerHit / rangeAttackSpeed;

	// Calculates hits required, combat time and average monster kill speed.
	const monsterHP = currentMonsterData.hitpoints;
	const monsterKillSpeed = monsterHP / DPS;
	let hits = 0;

	for (let i = 0; i < quantity; i++) {
		let hitpointsLeft = monsterHP;
		while (hitpointsLeft > 0) {
			let hitdamage = 0;
			if (hitChance >= Math.random()) {
				hitdamage = randInt(1, maxHit);
			}
			hitpointsLeft -= hitdamage;
			hits++;
		}
	}
	const combatDuration = hits * rangeWeapon.weapon.attack_speed;

	return [combatDuration, hits, DPS, monsterKillSpeed];
}
