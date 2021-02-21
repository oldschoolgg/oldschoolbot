import { randInt } from 'e';
import { KlasaUser } from 'klasa';
import { Monsters } from 'oldschooljs';
import { MonsterAttribute } from 'oldschooljs/dist/meta/monsterData';
import { itemID } from 'oldschooljs/dist/util';

import hasItemEquipped from '../../gear/functions/hasItemEquipped';
import { hasMeleeVoidEquipped } from '../../gear/functions/hasMeleeVoidEquipped';
import resolveGearTypeSetting from '../../gear/functions/resolveGearTypeSetting';
import { sumOfSetupStats } from '../../gear/functions/sumOfSetupStats';
import { UserSettings } from '../../settings/types/UserSettings';
import { KillableMonster } from '../types';
import { GearSetupTypes } from './../../gear/types';
import { SkillsEnum } from './../../skilling/types';

interface MeleeStrengthWeaponBonus {
	id: number;
	damageBoost: number;
	againstAttribute?: string;
	againstMonster?: string[];
	wildernessBonus?: boolean;
}

// Added some of the most common melee weapon bonuses.
const meleeStrengthWeaponBonuses: MeleeStrengthWeaponBonus[] = [
	{
		id: itemID('Arclight'),
		damageBoost: 1.7,
		againstAttribute: MonsterAttribute.Demon
	},
	{
		id: itemID('Leaf-bladed battleaxe'),
		damageBoost: 1.175,
		againstMonster: ['kurask', 'turoth']
	},
	{
		id: itemID('Dragon hunter lance'),
		damageBoost: 1.2,
		againstAttribute: MonsterAttribute.Dragon
	},
	{
		id: itemID("Viggora's chainmace"),
		damageBoost: 1.5,
		wildernessBonus: true
	}
];

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
	if (meleeWeapon === null || meleeWeapon.weapon === null || combatStyle === null) {
		throw 'No melee weapon is equipped or combatStyle is not choosen.';
	}
	const meleeGear = user.settings.get(UserSettings.Gear.Melee);
	const gearStats = sumOfSetupStats(
		user.settings.get(resolveGearTypeSetting(GearSetupTypes.Melee))
	);

	// Calculate effective strength level
	let effectiveStrLvl =
		Math.floor(
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

	// Multiply by void bonus if wearing full melee void
	if (hasMeleeVoidEquipped(meleeGear)) {
		effectiveStrLvl *= 1.1;
	}

	effectiveStrLvl = Math.floor(effectiveStrLvl);

	// Calculate max hit
	let maxHit = Math.floor((effectiveStrLvl * (gearStats.melee_strength + 64) + 320) / 640);

	// Make sure black mask only work on slayer task in future
	// Check if wearing salve amulet or salve amulet (e), if wearing salve amulet, black mask DOSEN'T STACK.
	if (
		(hasItemEquipped(itemID('Salve amulet'), meleeGear) ||
			hasItemEquipped(itemID('Salve amulet(i)'), meleeGear)) &&
		currentMonsterData.attributes.find(_attribue => _attribue === MonsterAttribute.Undead)
	) {
		maxHit *= 7 / 6;
	} else if (
		(hasItemEquipped(itemID('Salve amulet (e)'), meleeGear) ||
			hasItemEquipped(itemID('Salve amulet(ei)'), meleeGear)) &&
		currentMonsterData.attributes.find(_attribue => _attribue === MonsterAttribute.Undead)
	) {
		maxHit *= 1.2;
	} else if (hasItemEquipped(itemID('Black mask'), meleeGear)) {
		maxHit *= 7 / 6;
	}

	maxHit = Math.floor(maxHit);

	for (const meleeStrengthBonus of meleeStrengthWeaponBonuses) {
		if (!hasItemEquipped(meleeStrengthBonus.id, meleeGear)) {
			continue;
		}
		if (
			meleeStrengthBonus.againstAttribute &&
			currentMonsterData.attributes.find(
				_attribue => _attribue === meleeStrengthBonus.againstAttribute
			)
		) {
			maxHit *= meleeStrengthBonus.damageBoost;
			break;
		}
		if (meleeStrengthBonus.againstMonster) {
			for (const monst of meleeStrengthBonus.againstMonster) {
				if (monst === monster.name.toLowerCase()) {
					maxHit *= meleeStrengthBonus.damageBoost;
					break;
				}
			}
			break;
		}
		if (meleeStrengthBonus.wildernessBonus && monster.wildy) {
			maxHit *= meleeStrengthBonus.damageBoost;
			break;
		}
	}

	maxHit = Math.floor(maxHit);

	// Calculate effective attack level
	let effectiveAttackLvl =
		Math.floor(
			user.skillLevel(SkillsEnum.Attack) /* + Attack boost: potions etc) * prayerbonus */
		) + 8;

	if (attackStyle === 'accurate') {
		effectiveAttackLvl += 3;
	}
	if (attackStyle === 'controlled') {
		effectiveAttackLvl += 1;
	}

	// Multiply by void bonus if wearing full melee void
	if (hasMeleeVoidEquipped(meleeGear)) {
		effectiveAttackLvl *= 1.1;
	}

	effectiveAttackLvl = Math.floor(effectiveAttackLvl);

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

	// Make sure black mask only work on slayer task in future
	// Check if wearing salve amulet or salve amulet (e), if wearing salve amulet, black mask DOSEN'T STACK.
	if (
		(hasItemEquipped(itemID('Salve amulet'), meleeGear) ||
			hasItemEquipped(itemID('Salve amulet(i)'), meleeGear)) &&
		currentMonsterData.attributes.find(_attribue => _attribue === MonsterAttribute.Undead)
	) {
		attackRoll *= 7 / 6;
	} else if (
		(hasItemEquipped(itemID('Salve amulet (e)'), meleeGear) ||
			hasItemEquipped(itemID('Salve amulet(ei)'), meleeGear)) &&
		currentMonsterData.attributes.find(_attribue => _attribue === MonsterAttribute.Undead)
	) {
		attackRoll *= 1.2;
	} else if (hasItemEquipped(itemID('Black mask'), meleeGear)) {
		attackRoll *= 7 / 6;
	}

	attackRoll = Math.floor(attackRoll);

	// Check if passive weapon accuracy.
	if (
		hasItemEquipped(itemID('Arclight'), meleeGear) &&
		currentMonsterData.attributes.find(_attribue => _attribue === MonsterAttribute.Demon)
	) {
		attackRoll *= 1.7;
	} else if (
		hasItemEquipped(itemID('Dragon hunter lance'), meleeGear) &&
		currentMonsterData.attributes.find(_attribue => _attribue === MonsterAttribute.Dragon)
	) {
		attackRoll *= 1.2;
	}

	// Reminder: Apply special attack accuracy here in future

	attackRoll = Math.floor(attackRoll);

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

	defenceRoll = Math.floor(defenceRoll);

	// Calculate hit chance
	let hitChance = 0;

	if (attackRoll > defenceRoll) {
		hitChance = 1 - (defenceRoll + 2) / (2 * attackRoll + 1);
	} else {
		hitChance = attackRoll / (2 * defenceRoll + 1);
	}

	// Calculate average damage per hit and dps
	const DamagePerHit = (maxHit * hitChance) / 2;
	const DPS = DamagePerHit / (meleeWeapon.weapon.attack_speed * 0.6);

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

	const combatDuration = hits * meleeWeapon.weapon.attack_speed * 0.6;

	return [combatDuration, hits, DPS, monsterKillSpeed];
}
