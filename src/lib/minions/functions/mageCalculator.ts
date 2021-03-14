import { randInt } from 'e';
import { KlasaUser } from 'klasa';
import { Monsters } from 'oldschooljs';
import { MonsterAttribute } from 'oldschooljs/dist/meta/monsterData';
import { itemID } from 'oldschooljs/dist/util';

import { GearSetupTypes, hasItemEquipped } from '../../../lib/gear';
import { Time } from '../../constants';
import { hasEliteMagicVoidEquipped } from '../../gear/functions/hasEliteMagicVoidEquipped';
import { hasMagicVoidEquipped } from '../../gear/functions/hasMagicVoidEquipped';
import { sumOfSetupStats } from '../../gear/functions/sumOfSetupStats';
import { UserSettings } from '../../settings/types/UserSettings';
import castables from '../../skilling/skills/combat/magic/castables';
import { stringMatches } from '../../util';
import { KillableMonster } from '../types';
import { SkillsEnum } from './../../skilling/types';
import calculatePrayerDrain from './calculatePrayerDrain';
import potionBoostCalculator from './potionBoostCalculator';

// Mage Prayer bonus
const magePrayerBonuses = [
	{
		name: 'Augury',
		boost: 1.25
	},
	{
		name: 'Mystic Might',
		boost: 1.15
	},
	{
		name: 'Mystic Lore',
		boost: 1.1
	},
	{
		name: 'Mystic Will',
		boost: 1.05
	}
];

export default async function mageCalculator(
	monster: KillableMonster,
	user: KlasaUser,
	quantity: number | null
): Promise<[number, number, number, number, number, string[]]> {
	// https://oldschool.runescape.wiki/w/Damage_per_second/Magic as source.
	const combatStyle = user.settings.get(UserSettings.Minion.MageCombatStyle);
	const combatSpell = user.settings.get(UserSettings.Minion.CombatSpell);
	const currentMonsterData = Monsters.find(mon => mon.id === monster.id)?.data;
	if (!currentMonsterData) {
		throw "Monster dosen't exist.";
	}
	const mageWeapon = user.equippedWeapon(GearSetupTypes.Mage);
	if (mageWeapon === null || mageWeapon.weapon === null || combatStyle === null) {
		throw 'No mage weapon is equipped or combatStyle is not choosen.';
	}
	const mageGear = user.settings.get(UserSettings.Gear.Mage);

	if (!mageGear) throw `No mage gear on user.`;
	if (combatSpell === null) {
		throw `Spell is null`;
	}
	const spell = castables.find(_spell =>
		stringMatches(_spell.name.toLowerCase(), combatSpell.toLowerCase())
	);

	if (!spell) {
		throw `The default spell is wrong.`;
	}

	if (!spell.baseMaxHit) {
		throw 'Spell got no base max hit.';
	}
	if (
		spell.name.toLowerCase() === 'crumble undead' &&
		!currentMonsterData.attributes.find(_attribue => _attribue === MonsterAttribute.Undead)
	) {
		throw 'Crumble undead can only be used against undead enemies.';
	}
	const gearStats = sumOfSetupStats(user.getGear('mage'));

	// Calculate effective magic level

	const [magePotionBoost, magePotUsed] = potionBoostCalculator(user, SkillsEnum.Magic);

	let prayerMageBonus = 1;
	for (const magePrayerBonus of magePrayerBonuses) {
		if (user.settings.get(UserSettings.SelectedPrayers).includes(magePrayerBonus.name.toLowerCase())) {
			prayerMageBonus = magePrayerBonus.boost;
			break;
		}
	}
	let effectiveMageLvl =
		Math.floor(user.skillLevel(SkillsEnum.Magic) + magePotionBoost) * prayerMageBonus + 8;
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
		effectiveMageLvl += 1;
	}

	// Multiply by void bonus if wearing full mage void
	if (hasMagicVoidEquipped(mageGear)) {
		effectiveMageLvl *= 1.45;
	}

	effectiveMageLvl = Math.floor(effectiveMageLvl);

	// Calculate max hit
	let maxHit = spell.baseMaxHit * (1 + gearStats.magic_damage / 100);

	if (
		mageWeapon.name.toLowerCase() === 'trident of the seas' ||
		mageWeapon.name === 'Trident of the seas (e)'
	) {
		maxHit = Math.floor(effectiveMageLvl / 3 - 5);
	}

	if (
		mageWeapon.name === 'Trident of the swamp' ||
		mageWeapon.name === 'Trident of the swamp (e)'
	) {
		maxHit = Math.floor(effectiveMageLvl / 3 - 2);
	}

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

	if (hasItemEquipped(itemID('Tome of fire'), mageGear) && spell.name.toLowerCase().includes('fire')) {
		maxHit *= 1.5;
	}

	maxHit = Math.floor(maxHit);

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

	if (
		mageWeapon.name.toLowerCase() === 'trident of the seas' ||
		mageWeapon.name === 'Trident of the seas (e)' ||
		mageWeapon.name === 'Trident of the swamp' ||
		mageWeapon.name === 'Trident of the swamp (e)'
	) {
		timeToCastSingleSpell = 4 * 0.6;
	}

	const DPS = DamagePerHit / timeToCastSingleSpell;

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
	let combatDuration = hits * timeToCastSingleSpell * Time.Second;

	combatDuration += monster.mechanicsTime ? monster.mechanicsTime * quantity : 0;

	combatDuration += monster.respawnTime ? monster.respawnTime * quantity : 0;

	combatDuration += (monster.bankTripTime / monster.killsPerBankTrip) * quantity;

	// Calculates prayer drain and removes enough prayer potion doses.
	await calculatePrayerDrain(user, monster, quantity, gearStats.prayer, monsterKillSpeed);

	return [combatDuration, hits, DPS, monsterKillSpeed, quantity, [magePotUsed]];
}
