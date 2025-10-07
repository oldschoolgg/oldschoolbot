import type { GearSetupType } from '@prisma/client';

import { GearSetupTypes } from '@/lib/gear/types.js';

export function isValidGearSetup(str: string): str is GearSetupType {
	return GearSetupTypes.includes(str as any);
}
