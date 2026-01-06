import { type DefenceGearStat, GearStat, type OffenceGearStat } from '@oldschoolgg/gear';

import type { GearSetupType } from '@/prisma/main/enums.js';

export function convertAttackStyleToGearSetup(style: OffenceGearStat | DefenceGearStat) {
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
