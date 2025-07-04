import { type DefenceGearStat, GearStat, type OffenceGearStat } from 'oldschooljs/gear';

const offenceMap: { [key in OffenceGearStat]: DefenceGearStat } = {
	[GearStat.AttackSlash]: GearStat.DefenceSlash,
	[GearStat.AttackStab]: GearStat.DefenceStab,
	[GearStat.AttackCrush]: GearStat.DefenceCrush,
	[GearStat.AttackMagic]: GearStat.DefenceMagic,
	[GearStat.AttackRanged]: GearStat.DefenceRanged
};

export function inverseOfOffenceStat(stat: OffenceGearStat) {
	return offenceMap[stat];
}
