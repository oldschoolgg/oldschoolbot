import { randInt } from 'e';
import { KlasaUser } from 'klasa';
import { Monsters } from 'oldschooljs';
import { MonsterAttribute } from 'oldschooljs/dist/meta/monsterData';
import { itemID } from 'oldschooljs/dist/util';

import { GearSetupTypes, hasItemEquipped } from '../../../lib/gear';
import { Time } from '../../constants';
import { hasEliteRangedVoidEquipped } from '../../gear/functions/hasEliteRangedVoidEquipped';
import { hasRangedVoidEquipped } from '../../gear/functions/hasRangedVoidEquipped';
import { sumOfSetupStats } from '../../gear/functions/sumOfSetupStats';
import { UserSettings } from '../../settings/types/UserSettings';
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
		damageBoost: 1.3,
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
	quantity: number | null
): Promise<[number, number, number, number, number, string[]]> {
	// https://oldschool.runescape.wiki/w/Damage_per_second/Ranged as source.
	const combatStyle = user.settings.get(UserSettings.Minion.RangeCombatStyle);
	const currentMonsterData = Monsters.find(mon => mon.id === monster.id)?.data;
	if (!currentMonsterData) {
		throw "Monster dosen't exist.";
	}
	const rangeWeapon = user.equippedWeapon(GearSetupTypes.Range);
	if (rangeWeapon === null || rangeWeapon.weapon === null || combatStyle === null) {
		throw 'No range weapon is equipped or combatStyle is not choosen.';
	}
	const rangeGear = user.settings.get(UserSettings.Gear.Range);

	if (!rangeGear) throw `No range gear on user.`;
	let gearStats = sumOfSetupStats(user.getGear('range'));

	if (rangeWeapon.name.toLowerCase() === 'toxic blowpipe') {
		const defaultDart = user.settings.get(UserSettings.Minion.defaultDartToUse);
		const dart = getOSItem(defaultDart);
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
	let effectiveRangeStr =
		Math.floor(user.skillLevel(SkillsEnum.Ranged) + rangePotionBoost) * prayerRangeBonus + 8;

	if (combatStyle === 'accurate') {
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
		hasItemEquipped(itemID('Salve amulet(i)'), rangeGear) &&
		currentMonsterData.attributes.find(_attribue => _attribue === MonsterAttribute.Undead)
	) {
		maxHit *= 1.15;
	} else if (
		hasItemEquipped(itemID('Salve amulet(ei)'), rangeGear) &&
		currentMonsterData.attributes.find(_attribue => _attribue === MonsterAttribute.Undead)
	) {
		maxHit *= 1.2;
	} else if (hasItemEquipped(itemID('Black mask (i)'), rangeGear)) {
		maxHit *= 1.15;
	}

	maxHit = Math.floor(maxHit);

	for (const rangeMaxHitWeaponBonus of rangeMaxHitWeaponBonuses) {
		if (!hasItemEquipped(rangeMaxHitWeaponBonus.id, rangeGear)) {
			continue;
		}
		if (
			rangeMaxHitWeaponBonus.againstAttribute &&
			currentMonsterData.attributes.find(
				_attribue => _attribue === rangeMaxHitWeaponBonus.againstAttribute
			)
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
		if (hasItemEquipped(itemID('Twisted bow'), rangeGear)) {
			const twistBowMagicPick = Math.max(
				currentMonsterData.magicLevel,
				currentMonsterData.attackMagic
			);
			maxHit *=
				Math.min(
					250 +
						(3 * twistBowMagicPick - 14) / 100 -
						Math.pow((3 * twistBowMagicPick) / 10 - 140, 2) / 100,
					250
				) / 100;
			break;
		}
	}

	maxHit = Math.floor(maxHit);

	// Calculate effective ranged attack
	let effectiveRangeAttack =
		Math.floor(user.skillLevel(SkillsEnum.Ranged) + rangePotionBoost) * prayerRangeBonus + 8;

	if (combatStyle === 'accurate') {
		effectiveRangeAttack += 3;
	}
	if (combatStyle === 'controlled') {
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
		hasItemEquipped(itemID('Salve amulet(i)'), rangeGear) &&
		currentMonsterData.attributes.find(_attribue => _attribue === MonsterAttribute.Undead)
	) {
		attackRoll *= 1.15;
	} else if (
		hasItemEquipped(itemID('Salve amulet(ei)'), rangeGear) &&
		currentMonsterData.attributes.find(_attribue => _attribue === MonsterAttribute.Undead)
	) {
		attackRoll *= 1.2;
	} else if (hasItemEquipped(itemID('Black mask (i)'), rangeGear)) {
		attackRoll *= 1.15;
	}

	attackRoll = Math.floor(attackRoll);

	// Check if passive weapon accuracy.
	if (
		hasItemEquipped(itemID('Dragon hunter crossbow'), rangeGear) &&
		currentMonsterData.attributes.find(_attribue => _attribue === MonsterAttribute.Dragon)
	) {
		attackRoll *= 1.3;
	} else if (hasItemEquipped(itemID('Twisted bow'), rangeGear)) {
		const twistBowMagicPick = Math.max(
			currentMonsterData.magicLevel,
			currentMonsterData.attackMagic
		);
		attackRoll *=
			Math.min(
				140 +
					(3 * twistBowMagicPick - 10) / 100 -
					Math.pow((3 * twistBowMagicPick) / 10 - 100, 2) / 100,
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
		combatStyle === 'rapid'
			? rangeWeapon.weapon.attack_speed - 1
			: rangeWeapon.weapon.attack_speed;
	const DPS = DamagePerHit / (rangeAttackSpeed * 0.6);

	// Calculates hits required, combat time and average monster kill speed.
	const monsterHP = currentMonsterData.hitpoints;
	const monsterKillSpeed = (monsterHP / DPS) * Time.Second;
	// If no quantity provided, set it to the max.
	if (quantity === null || user.maxTripLength * 1.1 < Math.abs(monsterKillSpeed * 1.3 * quantity)) {
		quantity = Math.min(Math.floor(user.maxTripLength / (monsterKillSpeed * 1.3)), 5000);
		if (quantity < 1) quantity = 1;
	}
	let hits = 0;

	for (let i = 0; i < quantity; i++) {
		let hitpointsLeft = monsterHP;
		while (hitpointsLeft > 0 && hits < 1000) {
			let hitdamage = 0;
			if (Math.random() <= hitChance) {
				hitdamage = randInt(0, maxHit);
			}
			hitpointsLeft -= hitdamage;
			hits++;
		}
	}
	let combatDuration = hits * rangeAttackSpeed * 0.6 * Time.Second;

	combatDuration += monster.mechanicsTime ? monster.mechanicsTime * quantity : 0;

	combatDuration += monster.respawnTime ? monster.respawnTime * quantity : 0;

	combatDuration += (monster.bankTripTime / monster.killsPerBankTrip) * quantity;

	// Calculates prayer drain and removes enough prayer potion doses.
	await calculatePrayerDrain(user, monster, quantity, gearStats.prayer, monsterKillSpeed);

	return [combatDuration, hits, DPS, monsterKillSpeed, quantity, [rangePotUsed]];
}
