import { GearSetupTypes } from '@oldschoolgg/gear';

import type { GearSetupType } from '@/prisma/main/enums.js';

export function isValidGearSetup(str: string): str is GearSetupType {
	return GearSetupTypes.includes(str as GearSetupType);
}
