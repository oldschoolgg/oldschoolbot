import { type GearSetupType, GearSetupTypes } from './botSetups.js';
import { type DefenceGearStat, GearStat, type OffenceGearStat } from './types.js';

export function isValidGearStat(str: string): str is GearStat {
	return Object.values(GearStat).includes(str as GearStat);
}

export function convertAttackStyleToGearSetup(style: OffenceGearStat | DefenceGearStat): GearSetupType {
	let setup: GearSetupType = 'melee';

	switch (style) {
		case GearStat.AttackMagic:
			setup = 'mage';
			break;
		case GearStat.AttackRanged:
			setup = 'range';
			break;
		default:
			break;
	}

	return setup;
}

const offenceMap: { [key in OffenceGearStat]: DefenceGearStat } = {
	[GearStat.AttackSlash]: GearStat.DefenceSlash,
	[GearStat.AttackStab]: GearStat.DefenceStab,
	[GearStat.AttackCrush]: GearStat.DefenceCrush,
	[GearStat.AttackMagic]: GearStat.DefenceMagic,
	[GearStat.AttackRanged]: GearStat.DefenceRanged
};

export function inverseOfOffenceStat(stat: OffenceGearStat): DefenceGearStat {
	return offenceMap[stat];
}

export function isValidGearSetup(str: string): str is GearSetupType {
	return GearSetupTypes.includes(str as GearSetupType);
}
