import { BSOItem } from '@/lib/bso/BSOItem.js';

import type { GearSetup, GearSetupType } from '@oldschoolgg/gear';

import type { MUserClass } from '@/lib/user/MUser.js';

export const BEACH_COMBING_PET = {
	itemID: BSOItem.PATRICIA,
	name: 'Patricia',
	emoji: '<:starfish:1515651612918677564>',
	baseRate: 6_000,
	clIncreaseMultiplier: 2
} as const;

export const SUMMER_CRATE_S9_EMOJI = '<:s9chest:1515787545970081843>';

export async function convertMysteriousBottleToSeaWater(user: MUserClass): Promise<boolean> {
	const gearUpdates: { setup: GearSetupType; gear: GearSetup }[] = [];

	for (const setup of Object.keys(user.gear) as GearSetupType[]) {
		const rawGear = user.gear[setup].raw();
		let changed = false;
		if (rawGear['shield']?.item === BSOItem.MYSTERIOUS_BOTTLE) {
			rawGear['shield'].item = BSOItem.BOTTLE_OF_SEA_WATER;
			changed = true;
		}
		if (changed) {
			gearUpdates.push({ setup, gear: rawGear });
			break;
		}
	}

	if (gearUpdates.length === 0) {
		return false;
	}

	await user.updateGear(gearUpdates);
	return true;
}
