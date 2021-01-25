import { DefenceGearStat, GearStat, OffenceGearStat, OtherGearStat } from '../types';

// https://oldschool.runescape.wiki/w/Armour/Highest_bonuses
export const maxDefenceStats: { [key in DefenceGearStat]: number } = {
	[GearStat.DefenceCrush]: 621,
	[GearStat.DefenceMagic]: 461,
	[GearStat.DefenceRanged]: 659,
	[GearStat.DefenceSlash]: 621,
	[GearStat.DefenceStab]: 622
};

export const maxOffenceStats: { [key in OffenceGearStat]: number } = {
	[GearStat.AttackCrush]: 258,
	[GearStat.AttackMagic]: 426,
	[GearStat.AttackRanged]: 391,
	[GearStat.AttackSlash]: 273,
	[GearStat.AttackStab]: 274
};

export const maxOtherStats: { [key in OtherGearStat]: number } = {
	[GearStat.MeleeStrength]: 204,
	[GearStat.RangedStrength]: 172,
	[GearStat.MagicDamage]: 38,
	[GearStat.Prayer]: 66
};
