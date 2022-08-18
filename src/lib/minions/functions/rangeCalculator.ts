import { attackStyles_enum } from '@prisma/client';
import { randInt, Time } from 'e';
import { KlasaUser } from 'klasa';
import { Monsters } from 'oldschooljs';
import { MonsterAttribute } from 'oldschooljs/dist/meta/monsterData';
import { itemID } from 'oldschooljs/dist/util';

import { hasEliteRangedVoidEquipped, hasRangedVoidEquipped } from '../../../lib/gear';
import { mahojiUsersSettingsFetch } from '../../../mahoji/mahojiSettings';
import { UserSettings } from '../../settings/types/UserSettings';
import { calcMaxTripLength } from '../../util/calcMaxTripLength';
import getOSItem from '../../util/getOSItem';
import { KillableMonster } from '../types';
import { SkillsEnum } from './../../skilling/types';
import calculatePrayerDrain from './calculatePrayerDrain';
import potionBoostCalculator from './potionBoostCalculator';

interface RangeMaxHitWeaponBonus {
	id: number;
	damageBoost: number;
	againstAttribute?: string;
	againstMonster?: string[];
	wildernessBonus?: boolean;
}

// Added some of the most common range weapon bonuses.
const rangeMaxHitWeaponBonuses: RangeMaxHitWeaponBonus[] = [
	{
		id: itemID('Dragon hunter crossbow'),
		damageBoost: 1.25,
		againstAttribute: MonsterAttribute.Dragon
	},
	{
		id: itemID("Craw's bow"),
		damageBoost: 1.5,
		wildernessBonus: true
	}
];

// Range Prayer bonus
const rangePrayerBonuses = [
	{
		name: 'Rigour',
		boost: 1.23
	},
	{
		name: 'Eagle Eye',
		boost: 1.15
	},
	{
		name: 'Hawk Eye',
		boost: 1.1
	},
	{
		name: 'Sharp Eye',
		boost: 1.05
	}
];

export default async function rangeCalculator(
	monster: KillableMonster,
	user: KlasaUser,
	quantity: number | undefined
): Promise<[number, number, number, number, number, number, string[]]> {
	// https://oldschool.runescape.wiki/w/Damage_per_second/Ranged as source.
	const mahojiUser = await mahojiUsersSettingsFetch(user.id);
	const attackStyle = mahojiUser.minion_rangedAttackStyle;
	const currentMonsterData = Monsters.find(mon => mon.id === monster.id)?.data;
	if (!currentMonsterData) {
		throw "Monster dosen't exist.";
	}
	const rangeWeapon = user.getGear('range').equippedWeapon();
	if (!rangeWeapon || rangeWeapon === null || rangeWeapon.weapon === null || attackStyle === null) {
		throw 'No range weapon is equipped or combatStyle is not choosen.';
	}
	const rangeGear = user.getGear('range');

	if (!rangeGear) throw 'No range gear on user.';
	let gearStats = user.getGear('range').stats;

	if (rangeWeapon.name.toLowerCase() === 'toxic blowpipe') {
		const blowpipeData = user.settings.get(UserSettings.Blowpipe);
		if (blowpipeData.dartID === null) throw 'No dart ID found';
		const dart = getOSItem(blowpipeData.dartID);
		if (dart.equipment) {
			gearStats.attack_ranged += dart.equipment.attack_ranged;
			gearStats.ranged_strength += dart.equipment.ranged_strength;
		}
	}

	// Calculate effective ranged strength

	const [rangePotionBoost, rangePotUsed] = potionBoostCalculator(user, SkillsEnum.Ranged);

	let prayerRangeBonus = 1;
	for (const rangePrayerBonus of rangePrayerBonuses) {
		if (user.settings.get(UserSettings.SelectedPrayers).includes(rangePrayerBonus.name.toLowerCase())) {
			prayerRangeBonus = rangePrayerBonus.boost;
			break;
		}
	}
	let effectiveRangeStr = Math.floor(user.skillLevel(SkillsEnum.Ranged) + rangePotionBoost) * prayerRangeBonus + 8;

	if (attackStyle === attackStyles_enum.accurate) {
		effectiveRangeStr += 3;
	}

	// Multiply by void bonus if wearing full elite/normal ranged void
	if (hasEliteRangedVoidEquipped(rangeGear)) {
		effectiveRangeStr *= 1.125;
	} else if (hasRangedVoidEquipped(rangeGear)) {
		effectiveRangeStr *= 1.1;
	}

	effectiveRangeStr = Math.floor(effectiveRangeStr);

	// Calculate max hit
	let maxHit = Math.floor((effectiveRangeStr * (gearStats.ranged_strength + 64) + 320) / 640);

	// Make sure black mask only work on slayer task in future
	// Check if wearing salve amulet(i) or salve amulet(ei), if wearing salve amulet, black mask DOSEN'T STACK.
	if (
		rangeGear.hasEquipped('Salve amulet(ei)') &&
		currentMonsterData.attributes.find(_attribue => _attribue === MonsterAttribute.Undead)
	) {
		maxHit *= 1.2;
	} else if (
		rangeGear.hasEquipped('Salve amulet(i)') &&
		currentMonsterData.attributes.find(_attribue => _attribue === MonsterAttribute.Undead)
	) {
		maxHit *= 1.15;
	} else if (rangeGear.hasEquipped('Black mask (i)')) {
		maxHit *= 1.15;
	}

	maxHit = Math.floor(maxHit);

	for (const rangeMaxHitWeaponBonus of rangeMaxHitWeaponBonuses) {
		if (!rangeGear.hasEquipped(rangeMaxHitWeaponBonus.id)) {
			continue;
		}
		if (
			rangeMaxHitWeaponBonus.againstAttribute &&
			currentMonsterData.attributes.find(_attribue => _attribue === rangeMaxHitWeaponBonus.againstAttribute)
		) {
			maxHit *= rangeMaxHitWeaponBonus.damageBoost;
			break;
		}
		if (rangeMaxHitWeaponBonus.againstMonster) {
			for (const monst of rangeMaxHitWeaponBonus.againstMonster) {
				if (monst === monster.name.toLowerCase()) {
					maxHit *= rangeMaxHitWeaponBonus.damageBoost;
					break;
				}
			}
			break;
		}
		if (rangeMaxHitWeaponBonus.wildernessBonus && monster.wildy) {
			maxHit *= rangeMaxHitWeaponBonus.damageBoost;
			break;
		}
		if (rangeGear.hasEquipped('Twisted bow')) {
			const twistBowMagicPick = Math.max(currentMonsterData.magicLevel, currentMonsterData.attackMagic);
			maxHit *=
				Math.min(
					250 + (3 * twistBowMagicPick - 14) / 100 - Math.pow((3 * twistBowMagicPick) / 10 - 140, 2) / 100,
					250
				) / 100;
			break;
		}
	}

	maxHit = Math.floor(maxHit);

	// Calculate effective ranged attack
	let effectiveRangeAttack = Math.floor(user.skillLevel(SkillsEnum.Ranged) + rangePotionBoost) * prayerRangeBonus + 8;

	if (attackStyle === attackStyles_enum.accurate) {
		effectiveRangeAttack += 3;
	}
	if (attackStyle === attackStyles_enum.controlled) {
		effectiveRangeAttack += 1;
	}

	// Multiply by void bonus if wearing full range void
	if (hasRangedVoidEquipped(rangeGear)) {
		effectiveRangeAttack *= 1.1;
	}

	effectiveRangeAttack = Math.floor(effectiveRangeAttack);

	// Calculate attack roll
	let attackRoll = effectiveRangeAttack * (gearStats.attack_ranged + 64);

	// Make sure black mask only work on slayer task in future
	// Check if wearing salve amulet(i) or salve amulet(ei), if wearing salve amulet, black mask DOSEN'T STACK.
	if (
		rangeGear.hasEquipped('Salve amulet(ei)') &&
		currentMonsterData.attributes.find(_attribue => _attribue === MonsterAttribute.Undead)
	) {
		attackRoll *= 1.2;
	} else if (
		rangeGear.hasEquipped('Salve amulet(i)') &&
		currentMonsterData.attributes.find(_attribue => _attribue === MonsterAttribute.Undead)
	) {
		attackRoll *= 1.15;
	} else if (rangeGear.hasEquipped('Black mask (i)')) {
		attackRoll *= 1.15;
	}

	attackRoll = Math.floor(attackRoll);

	// Check if passive weapon accuracy.
	if (
		rangeGear.hasEquipped('Dragon hunter crossbow') &&
		currentMonsterData.attributes.find(_attribue => _attribue === MonsterAttribute.Dragon)
	) {
		attackRoll *= 1.3;
	} else if (rangeGear.hasEquipped('Twisted bow')) {
		const twistBowMagicPick = Math.max(currentMonsterData.magicLevel, currentMonsterData.attackMagic);
		attackRoll *=
			Math.min(
				140 + (3 * twistBowMagicPick - 10) / 100 - Math.pow((3 * twistBowMagicPick) / 10 - 100, 2) / 100,
				140
			) / 100;
	}

	// Reminder: Apply special attack accuracy here in future

	attackRoll = Math.floor(attackRoll);

	// Calculate Defence roll
	let defenceRoll = currentMonsterData.defenceLevel + 9;

	defenceRoll *= currentMonsterData.defenceRanged + 64;

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

	let rangeAttackSpeed =
		attackStyle === attackStyles_enum.rapid
			? rangeWeapon.weapon!.attack_speed - 1
			: rangeWeapon.weapon!.attack_speed;
	const DPS = DamagePerHit / (rangeAttackSpeed * 0.6);

	// Calculates hits required, combat time and average monster kill speed.
	const monsterHP = currentMonsterData.hitpoints;
	const monsterKillSpeed = (monsterHP / DPS) * Time.Second;
	// If no quantity provided, set it to the max.
	// If no quantity provided, set it to the max.
	if (!quantity || quantity < 1) {
		//Arbitrarily choosen 
		quantity = 10_000;
	}
	let hits = 0;
	let calcQuantity = 0;
	let combatDuration = 0;
	for (let i = 0; i < quantity; i++) {
		let hitpointsLeft = monsterHP;
		while (hitpointsLeft > 0 && hits < 3000) {
			let hitdamage = 0;
			if (Math.random() <= hitChance) {
				hitdamage = randInt(0, maxHit);
			}
			combatDuration += rangeAttackSpeed * 0.6 * Time.Second;
			hitpointsLeft -= hitdamage;
			hits++;
		}
		calcQuantity++;
		combatDuration += monster.mechanicsTime ? monster.mechanicsTime : 0;
		combatDuration += monster.respawnTime ? monster.respawnTime : 0;
		combatDuration +=
			monster.bankTripTime && monster.killsPerBankTrip
				? (monster.bankTripTime / monster.killsPerBankTrip) : 0;
		if (combatDuration > calcMaxTripLength(user, 'MonsterKilling')) break;
	}

	// Calculates prayer drain and removes enough prayer potion doses.
	const totalDosesUsed = await calculatePrayerDrain(user, monster, calcQuantity, gearStats.prayer, monsterKillSpeed);

	return [combatDuration, hits, DPS, monsterKillSpeed, calcQuantity, totalDosesUsed, [rangePotUsed]];
}
