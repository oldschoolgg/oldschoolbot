import { objectKeys } from 'e';

import { GearStat, GearStats } from '../../gear/types';

export function gearSetupMeetsRequirement(
	gearStats: GearStats,
	gearRequirements: Partial<{ [key in GearStat]: number }>
): [false, keyof GearStats, number] | [true, null, null] {
	const keys = objectKeys(gearStats as Record<keyof GearStats, number>);
	for (const key of keys) {
		const required = gearRequirements?.[key];
		if (!required) continue;
		const has = gearStats[key];
		if (has < required) {
			return [false, key, has];
		}
	}
	return [true, null, null];
}
