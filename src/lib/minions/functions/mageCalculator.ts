import { randInt } from 'e';
import { KlasaUser } from 'klasa';
import { Monsters } from 'oldschooljs';
import { Time } from '../../constants';

import resolveGearTypeSetting from '../../gear/functions/resolveGearTypeSetting';
import { sumOfSetupStats } from '../../gear/functions/sumOfSetupStats';
import { UserSettings } from '../../settings/types/UserSettings';
import castables from '../../skilling/skills/combat/magic/castables';
import { stringMatches } from '../../util';
import { KillableMonster } from '../types';
import { GearSetupTypes } from './../../gear/types';
import { SkillsEnum } from './../../skilling/types';

export default function mageCalculator(
	monster: KillableMonster,
	user: KlasaUser,
	quantity: number
) {
	// https://oldschool.runescape.wiki/w/Damage_per_second/Magic as source.
	const combatStyle = user.settings.get(UserSettings.Minion.MageCombatStyle);
	const combatSpell = user.settings.get(UserSettings.Minion.CombatSpell);
	if (combatSpell === null) {
		console.log('Spell is null.');
		return;
	}
	const spell = castables.find(_spell =>
		stringMatches(_spell.name.toLowerCase(), combatSpell)
	);
	if (!spell?.baseMaxHit) {
		console.log('Spell got no base max hit.');
		return;
	}
	const currentMonsterData = Monsters.find(mon => mon.id === monster.id)?.data;
	if (!currentMonsterData) {
		console.log("Monster dosen't exist.");
		return;
	}
	const mageWeapon = user.equippedWeapon(GearSetupTypes.Mage);
	if (mageWeapon === null || mageWeapon.weapon === null) {
		console.log('Weapon is null.');
		return;
	}
	const gearStats = sumOfSetupStats(
		user.settings.get(resolveGearTypeSetting(GearSetupTypes.Mage))
	);

	// Calculate effective magic level
	let effectiveMageLvl =
		Math.round(
			user.skillLevel(SkillsEnum.Magic) /* + Magic boost: potions etc) * prayerbonus */
		) + 8;
	let attackStyle = '';
	for (let stance of mageWeapon.weapon.stances) {
		if (stance.combat_style.toLowerCase() === combatStyle) {
			attackStyle = stance.attack_style;
			break;
		}
	}

	if (attackStyle === 'accurate') {
		effectiveMageLvl += 3;
	}

	if (attackStyle === 'longrange') {
		effectiveMageLvl += 3;
	}

	/* if wearing full magic void
    effectiveMageLvl *= 1.45;
    */

	// Calculate max hit
	let maxHit = Math.round(spell?.baseMaxHit * (1 + gearStats.magic_damage));

	/* if wearing black mask (i) / slayer helm (i) or salve amulet DOSEN'T STACK
    maxHit *= 1.15 or 7/6
    */

	/* Bunch of other bonuses https://oldschool.runescape.wiki/w/Maximum_magic_hit maybe? */

	// Calculate accuracy roll
	let accuracyRoll = effectiveMageLvl * (gearStats.attack_magic + 64);

	/* if wearing black mask (i) / slayer helm (i) or salve amulet vs undead monster. DOSEN'T STACK
    attackRoll *= 1.15 or 7/6
    */

	accuracyRoll = Math.round(accuracyRoll);

	// Calculate Defence roll
	let defenceRoll = currentMonsterData.defenceLevel + 9;

	defenceRoll *= (currentMonsterData.defenceRanged + 64);

	defenceRoll = Math.round(defenceRoll);

	// Calculate hit chance
	let hitChance = 0;

	if (accuracyRoll > defenceRoll) {
		hitChance = 1 - (defenceRoll + 2) / (2 * accuracyRoll + 1);
	} else {
		hitChance = accuracyRoll / (2 * defenceRoll + 1);
	}

	// Calculate average damage per hit and dps
	const DamagePerHit = (maxHit * hitChance) / 2;

	// Get the base time to cast a spell then add on quarter of a second per cast to account for dumb minion.
	let timeToCastSingleSpell = spell.tickRate * Time.Second * 0.6 + Time.Second / 4;

	const DPS = DamagePerHit / timeToCastSingleSpell;

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
	const combatDuration = hits * timeToCastSingleSpell;

	return [combatDuration, hits, DPS, monsterKillSpeed];
}
