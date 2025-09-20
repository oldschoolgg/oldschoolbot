import type { GearSetupType } from '@prisma/client';

import { GearSetupTypes } from '../types.js';

export function isValidGearSetup(str: string): str is GearSetupType {
	return GearSetupTypes.includes(str as any);
}
