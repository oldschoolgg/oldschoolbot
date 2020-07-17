import { GearStat, DefenceGearStat } from '../types';

// https://oldschool.runescape.wiki/w/Armour/Highest_bonuses
export const maxDefenceStats: Partial<{ [key in DefenceGearStat]: number }> = {
	[GearStat.DefenceCrush]: 505,
	[GearStat.DefenceMagic]: 253,
	[GearStat.DefenceRanged]: 542,
	[GearStat.DefenceSlash]: 521,
	[GearStat.DefenceStab]: 519
};
