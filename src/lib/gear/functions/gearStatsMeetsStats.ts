import { GearTypes } from '..';

export function gearStatsMeetsStats(
	requirementStats: GearTypes.GearStats,
	statsToCheck: GearTypes.GearStats
): boolean {
	for (const key of Object.keys(requirementStats) as (keyof GearTypes.GearStats)[]) {
		console.log(key);
		if (requirementStats[key] > statsToCheck[key]) return false;
	}
	return true;
}
