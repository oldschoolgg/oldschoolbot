import { GearStat } from './types.js';

export function isValidGearStat(str: string): str is GearStat {
	return Object.values(GearStat).includes(str as GearStat);
}
