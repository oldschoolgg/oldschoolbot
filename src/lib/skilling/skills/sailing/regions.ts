export type SailingRegionId = 'starter_sea' | 'kandarin_coast' | 'great_kourend' | 'wilderness_seas';

export interface SailingRegion {
	id: SailingRegionId;
	name: string;
	requiredCharts: number;
	level: number;
	riskBonus: number;
	lootMultiplier: number;
	xpMultiplier: number;
	timeMultiplier: number;
}

export const SailingRegions: SailingRegion[] = [
	{
		id: 'starter_sea',
		name: 'Starter Sea',
		requiredCharts: 0,
		level: 1,
		riskBonus: 0,
		lootMultiplier: 1,
		xpMultiplier: 1,
		timeMultiplier: 1
	},
	{
		id: 'kandarin_coast',
		name: 'Kandarin Coast',
		requiredCharts: 3,
		level: 15,
		riskBonus: 0.02,
		lootMultiplier: 1.05,
		xpMultiplier: 1.05,
		timeMultiplier: 1.02
	},
	{
		id: 'great_kourend',
		name: 'Great Kourend',
		requiredCharts: 5,
		level: 30,
		riskBonus: 0.04,
		lootMultiplier: 1.1,
		xpMultiplier: 1.1,
		timeMultiplier: 1.05
	},
	{
		id: 'wilderness_seas',
		name: 'Wilderness Seas',
		requiredCharts: 8,
		level: 45,
		riskBonus: 0.08,
		lootMultiplier: 1.2,
		xpMultiplier: 1.15,
		timeMultiplier: 1.1
	}
];

export const SailingRegionById = new Map(SailingRegions.map(r => [r.id, r]));
