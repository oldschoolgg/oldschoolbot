import { randInt } from 'e';
import { KlasaUser } from 'klasa';
import { Monsters } from 'oldschooljs';
import { MonsterAttribute } from 'oldschooljs/dist/meta/monsterData';
import { itemID } from 'oldschooljs/dist/util';

import { hasEliteMagicVoidEquipped } from '../../gear/functions/hasEliteMagicVoidEquipped';
import { hasMagicVoidEquipped } from '../../gear/functions/hasMagicVoidEquipped';
import { GearSetupTypes, resolveGearTypeSetting, hasItemEquipped } from '../../../lib/gear';
import { sumOfSetupStats } from '../../gear/functions/sumOfSetupStats';
import { UserSettings } from '../../settings/types/UserSettings';
import castables from '../../skilling/skills/combat/magic/castables';
import { stringMatches } from '../../util';
import { KillableMonster } from '../types';
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
		throw `Spell is null`;
	}
	const spell = castables.find(_spell =>
		stringMatches(_spell.name.toLowerCase(), combatSpell.toLowerCase())
	);
	if (!spell?.baseMaxHit) {
		throw 'Spell got no base max hit.';
	}
	const currentMonsterData = Monsters.find(mon => mon.id === monster.id)?.data;
	if (!currentMonsterData) {
		throw "Monster dosen't exist.";
	}
	const mageWeapon = user.equippedWeapon(GearSetupTypes.Mage);
	if (mageWeapon === null || mageWeapon.weapon === null || combatStyle === null) {
		throw 'No mage weapon is equipped or combatStyle is not choosen.';
	}
	const mageGear = user.settings.get(UserSettings.Gear.Mage);
	const gearStats = sumOfSetupStats(
		user.settings.get(resolveGearTypeSetting(GearSetupTypes.Mage))
	);

	// Calculate effective magic level
	let effectiveMageLvl =
		Math.floor(
			user.skillLevel(SkillsEnum.Magic) /* + Magic boost: potions etc) * prayerbonus */
		) + 8;
	let attackStyle = '';
	for (let stance of mageWeapon.weapon.stances) {
		if (stance.combat_style.toLowerCase() === combatStyle) {
			attackStyle = stance.attack_style;
			break;
		}
	}

	// Currently won't work, since combatStyles are only standard/defensive atm
	if (attackStyle === 'accurate') {
		effectiveMageLvl += 3;
	}

	if (attackStyle === 'longrange') {
		effectiveMageLvl += 3;
	}

	// Multiply by void bonus if wearing full mage void
	if (hasMagicVoidEquipped(mageGear)) {
		effectiveMageLvl *= 1.45;
	}

	effectiveMageLvl = Math.floor(effectiveMageLvl);

	// Calculate max hit
	let maxHit = spell?.baseMaxHit * (1 + gearStats.magic_damage / 100);

	// Multiply by void bonus if wearing full elite mage void
	if (hasEliteMagicVoidEquipped(mageGear)) {
		maxHit *= 1.025;
	}

	// Check if passive weapon damage bonus smoke staff.
	if (
		hasItemEquipped(itemID('Smoke battlestaff'), mageGear) ||
		hasItemEquipped(itemID('Mystic smoke staff'), mageGear)
	) {
		maxHit *= 1.1;
	}

	maxHit = Math.floor(maxHit);

	// Make sure black mask only work on slayer task in future
	// Check if wearing salve amulet(i) or salve amulet(ei), if wearing salve amulet, black mask DOSEN'T STACK.
	if (
		hasItemEquipped(itemID('Salve amulet(i)'), mageGear) &&
		currentMonsterData.attributes.find(_attribue => _attribue === MonsterAttribute.Undead)
	) {
		maxHit *= 1.15;
	} else if (
		hasItemEquipped(itemID('Salve amulet(ei)'), mageGear) &&
		currentMonsterData.attributes.find(_attribue => _attribue === MonsterAttribute.Undead)
	) {
		maxHit *= 1.2;
	} else if (hasItemEquipped(itemID('Black mask (i)'), mageGear)) {
		maxHit *= 1.15;
	}

	maxHit = Math.floor(maxHit);

	if (hasItemEquipped(itemID('Tome of fire'), mageGear) && spell.name.includes('fire')) {
		maxHit *= 1.5;
	}

	maxHit = Math.floor(maxHit);

	/* Handle slayer dart, tridents, salamander, ibans staff etc? https://oldschool.runescape.wiki/w/Maximum_magic_hit maybe? */

	// Calculate accuracy roll
	let accuracyRoll = effectiveMageLvl * (gearStats.attack_magic + 64);

	// Make sure black mask only work on slayer task in future
	// Check if wearing salve amulet(i) or salve amulet(ei), if wearing salve amulet, black mask DOSEN'T STACK.
	if (
		hasItemEquipped(itemID('Salve amulet(i)'), mageGear) &&
		currentMonsterData.attributes.find(_attribue => _attribue === MonsterAttribute.Undead)
	) {
		accuracyRoll *= 1.15;
	} else if (
		hasItemEquipped(itemID('Salve amulet(ei)'), mageGear) &&
		currentMonsterData.attributes.find(_attribue => _attribue === MonsterAttribute.Undead)
	) {
		accuracyRoll *= 1.2;
	} else if (hasItemEquipped(itemID('Black mask (i)'), mageGear)) {
		accuracyRoll *= 1.15;
	}

	accuracyRoll = Math.floor(accuracyRoll);

	// Check if passive weapon accuracy.
	if (
		hasItemEquipped(itemID('Smoke battlestaff'), mageGear) ||
		hasItemEquipped(itemID('Mystic smoke staff'), mageGear)
	) {
		accuracyRoll *= 1.1;
	}

	accuracyRoll = Math.floor(accuracyRoll);

	// Calculate Defence roll
	let defenceRoll = currentMonsterData.magicLevel + 9;

	defenceRoll *= currentMonsterData.defenceMagic + 64;

	defenceRoll = Math.floor(defenceRoll);

	// Calculate hit chance
	let hitChance = 0;

	if (accuracyRoll > defenceRoll) {
		hitChance = 1 - (defenceRoll + 2) / (2 * accuracyRoll + 1);
	} else {
		hitChance = accuracyRoll / (2 * defenceRoll + 1);
	}

	// Calculate average damage per hit and dps
	const DamagePerHit = (maxHit * hitChance) / 2;

	// Get the base time to cast a spell
	let timeToCastSingleSpell = spell.tickRate * 0.6;

	const DPS = DamagePerHit / timeToCastSingleSpell;
	console.log(hitChance, maxHit, timeToCastSingleSpell);

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
