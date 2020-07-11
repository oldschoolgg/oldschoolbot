import { GearStat, AttackGearStat, DefenceGearStat } from '../types';

const mapObj: { [key in AttackGearStat]: DefenceGearStat } = {
	[GearStat.AttackSlash]: GearStat.DefenceSlash,
	[GearStat.AttackStab]: GearStat.DefenceStab,
	[GearStat.AttackCrush]: GearStat.DefenceCrush,
	[GearStat.AttackMagic]: GearStat.DefenceMagic,
	[GearStat.AttackRanged]: GearStat.DefenceRanged
};

export default function inverseOfAttackStat(stat: AttackGearStat) {
	return mapObj[stat];
}
