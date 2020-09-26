import { objectKeys } from 'e';
import { O } from 'ts-toolbelt';

import { GearStats } from '../../gear/types';
import { GearRequirement } from '../types';

export function gearSetupMeetsRequirement(
	gearStats: O.Readonly<GearStats>,
	gearRequirements: O.Readonly<GearRequirement>
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
