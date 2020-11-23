import { randInt } from 'e';
import { KlasaUser } from 'klasa';
import { Monsters } from 'oldschooljs';

import resolveGearTypeSetting from '../../gear/functions/resolveGearTypeSetting';
import { sumOfSetupStats } from '../../gear/functions/sumOfSetupStats';
import { UserSettings } from '../../settings/types/UserSettings';
import { KillableMonster } from '../types';
import { GearSetupTypes } from './../../gear/types';
import { SkillsEnum } from './../../skilling/types';

export default function meleeCalculator(
	monster: KillableMonster,
	user: KlasaUser,
	quantity: number
) {
	// https://oldschool.runescape.wiki/w/Damage_per_second/Melee as source.
	const combatStyle = user.settings.get(UserSettings.Minion.MeleeCombatStyle);
	const currentMonsterData = Monsters.find(mon => mon.id === monster.id)?.data;
	if (!currentMonsterData) {
		throw "Monster dosen't exist.";
	}
	const meleeWeapon = user.equippedWeapon(GearSetupTypes.Melee);
	if (meleeWeapon === null || meleeWeapon.weapon === null) {
		throw 'Weapon is null.';
	}
	const gearStats = sumOfSetupStats(
		user.settings.get(resolveGearTypeSetting(GearSetupTypes.Melee))
	);

	// Calculate effective strength level
	let effectiveStrLvl =
		Math.round(
			user.skillLevel(SkillsEnum.Strength) /* + Strength boost: potions etc) * prayerbonus */
		) + 8;
	let attackStyle = '';
	let combatType = '';
	for (let stance of meleeWeapon.weapon.stances) {
		if (stance.combat_style.toLowerCase() === combatStyle) {
			attackStyle = stance.attack_style;
			combatType = stance.attack_type;
			break;
		}
	}

	if (attackStyle === 'aggresive') {
		effectiveStrLvl += 3;
	}
	if (attackStyle === 'controlled') {
		effectiveStrLvl += 1;
	}

	/* if wearing full melee voif
    effectiveStrLvl *= 1.1;
    */

	// Calculate max hit
	let maxHit = Math.round((effectiveStrLvl * (gearStats.melee_strength + 64) + 320) / 640);

	/* if wearing black mask / slayer helm or salve amulet DOSEN'T STACK
    maxHit *= 7/6
    */

	// Calculate effective attack level
	let effectiveAttackLvl =
		Math.round(
			user.skillLevel(SkillsEnum.Attack) /* + Attack boost: potions etc) * prayerbonus */
		) + 8;

	if (attackStyle === 'aggresive') {
		effectiveAttackLvl += 3;
	}
	if (attackStyle === 'controlled') {
		effectiveAttackLvl += 1;
	}

	/* if wearing full melee voif
    effectiveAttackLvl *= 1.1;
    */

	// Calculate attack roll
	let attackRoll = 0;

	switch (combatType.toLowerCase()) {
		case 'stab':
			attackRoll = effectiveAttackLvl * (gearStats.attack_stab + 64);
			break;
		case 'slash':
			attackRoll = effectiveAttackLvl * (gearStats.attack_slash + 64);
			break;
		case 'crush':
			attackRoll = effectiveAttackLvl * (gearStats.attack_crush + 64);
			break;
	}

	/* if wearing black mask / slayer helm or salve amulet vs undead monster. DOSEN'T STACK
    attackRoll *= 7/6
    */

	attackRoll = Math.round(attackRoll);

	// Calculate Defence roll
	let defenceRoll = currentMonsterData.defenceLevel + 9;

	switch (combatType.toLowerCase()) {
		case 'stab':
			defenceRoll *= currentMonsterData.defenceStab + 64;
			break;
		case 'slash':
			defenceRoll *= currentMonsterData.defenceSlash + 64;
			break;
		case 'crush':
			defenceRoll *= currentMonsterData.defenceCrush + 64;
			break;
	}

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
	const DPS = DamagePerHit / meleeWeapon.weapon.attack_speed;

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
	const combatDuration = hits * meleeWeapon.weapon.attack_speed;

	return [combatDuration, hits, DPS, monsterKillSpeed];
}
