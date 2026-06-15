import type { GearSetup, GearSetupType } from '@oldschoolgg/gear';

import { BSOItem } from '@/lib/bso/BSOItem.js';
import type { MUserClass } from '@/lib/user/MUser.js';

export async function convertMysteriousBottleToSeaWater(user: MUserClass): Promise<boolean> {
	const gearUpdates: { setup: GearSetupType; gear: GearSetup }[] = [];

	for (const setup of Object.keys(user.gear) as GearSetupType[]) {
		const rawGear = user.gear[setup].raw();
		let changed = false;

		for (const slot of Object.keys(rawGear) as (keyof GearSetup)[]) {
			const equipped = rawGear[slot];
			if (equipped?.item === BSOItem.MYSTERIOUS_BOTTLE) {
				rawGear[slot] = { ...equipped, item: BSOItem.BOTTLE_OF_SEA_WATER };
				changed = true;
			}
		}

		if (changed) {
			gearUpdates.push({ setup, gear: rawGear });
		}
	}

	if (gearUpdates.length === 0) {
		return false;
	}

	await user.updateGear(gearUpdates);
	return true;
}
