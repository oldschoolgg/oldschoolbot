import type { GearSetupType } from '@/prisma/main.js';
import type { Gear } from '@/lib/structures/Gear.js';

export type UserFullGearSetup = {
	[key in GearSetupType]: Gear;
};
