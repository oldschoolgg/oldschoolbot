import { GearStat } from 'oldschooljs';

import type { GearSetupType } from '@/prisma/main/enums.js';
import { GearSetupTypes } from '@/lib/gear/types.js';

export function isValidGearSetup(str: string): str is GearSetupType {
	return GearSetupTypes.includes(str as GearSetupType);
}

export function isValidGearStat(str: string): str is GearStat {
	return Object.values(GearStat).includes(str as GearStat);
}
