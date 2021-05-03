import { EquipmentSlot } from 'oldschooljs/dist/meta/types';

import { DefenceGearStat, GearSetup, GearStat, OffenceGearStat, OtherGearStat } from './types';

export * from './types';
export * from './util';

// https://oldschool.runescape.wiki/w/Armour/Highest_bonuses
export const maxDefenceStats: { [key in DefenceGearStat]: number } = {
	[GearStat.DefenceCrush]: 505,
	[GearStat.DefenceMagic]: 253,
	[GearStat.DefenceRanged]: 542,
	[GearStat.DefenceSlash]: 521,
	[GearStat.DefenceStab]: 519
};

export const maxOffenceStats: { [key in OffenceGearStat]: number } = {
	[GearStat.AttackCrush]: 214,
	[GearStat.AttackMagic]: 177,
	[GearStat.AttackRanged]: 243,
	[GearStat.AttackSlash]: 182,
	[GearStat.AttackStab]: 177
};

export const maxOtherStats: { [key in OtherGearStat]: number } = {
	[GearStat.MeleeStrength]: 204,
	[GearStat.RangedStrength]: 172,
	[GearStat.MagicDamage]: 38,
	[GearStat.Prayer]: 66
};

export const defaultGear: GearSetup = {
	[EquipmentSlot.TwoHanded]: null,
	[EquipmentSlot.Ammo]: null,
	[EquipmentSlot.Body]: null,
	[EquipmentSlot.Cape]: null,
	[EquipmentSlot.Feet]: null,
	[EquipmentSlot.Hands]: null,
	[EquipmentSlot.Head]: null,
	[EquipmentSlot.Legs]: null,
	[EquipmentSlot.Neck]: null,
	[EquipmentSlot.Ring]: null,
	[EquipmentSlot.Shield]: null,
	[EquipmentSlot.Weapon]: null
};
