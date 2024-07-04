import type { DefenceGearStat, OffenceGearStat } from '../types';
import { GearStat } from '../types';

const defenceMap: { [key in DefenceGearStat]: OffenceGearStat } = {
	[GearStat.DefenceSlash]: GearStat.AttackSlash,
	[GearStat.DefenceStab]: GearStat.AttackStab,
	[GearStat.DefenceCrush]: GearStat.AttackCrush,
	[GearStat.DefenceMagic]: GearStat.AttackMagic,
	[GearStat.DefenceRanged]: GearStat.AttackRanged
};

const offenceMap: { [key in OffenceGearStat]: DefenceGearStat } = {
	[GearStat.AttackSlash]: GearStat.DefenceSlash,
	[GearStat.AttackStab]: GearStat.DefenceStab,
	[GearStat.AttackCrush]: GearStat.DefenceCrush,
	[GearStat.AttackMagic]: GearStat.DefenceMagic,
	[GearStat.AttackRanged]: GearStat.DefenceRanged
};

function inverseOfDefenceStat(stat: DefenceGearStat) {
	return defenceMap[stat];
}

export function inverseOfOffenceStat(stat: OffenceGearStat) {
	return offenceMap[stat];
}
