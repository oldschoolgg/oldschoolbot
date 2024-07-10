import { EquipmentSlot } from 'oldschooljs/dist/meta/types';

import { type DefenceGearStat, type GearSetup, GearStat, type OffenceGearStat, type OtherGearStat } from './types';

export * from './types';
export * from './util';

export const maxDefenceStats: { [key in DefenceGearStat]: number } = {
	[GearStat.DefenceCrush]: 789,
	[GearStat.DefenceMagic]: 480,
	[GearStat.DefenceRanged]: 681,
	[GearStat.DefenceSlash]: 637,
	[GearStat.DefenceStab]: 640
};

export const maxOffenceStats: { [key in OffenceGearStat]: number } = {
	[GearStat.AttackCrush]: 359,
	[GearStat.AttackMagic]: 537,
	[GearStat.AttackRanged]: 436,
	[GearStat.AttackSlash]: 300,
	[GearStat.AttackStab]: 364
};

export const maxOtherStats: { [key in OtherGearStat]: number } = {
	[GearStat.MeleeStrength]: 243,
	[GearStat.RangedStrength]: 172,
	[GearStat.MagicDamage]: 62,
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
Object.freeze(defaultGear);
