import { BSOItem } from '../BSOItem';

export const necromancySoulCollectors = [
	{
		item: BSOItem.SOUL_COLLECTOR_T1,
		levelToMake: 1,
		maxHarvestingLevel: 25
	},
	{
		item: BSOItem.SOUL_COLLECTOR_T2,
		levelToMake: 25,
		maxHarvestingLevel: 50
	},
	{
		item: BSOItem.SOUL_COLLECTOR_T3,
		levelToMake: 50,
		maxHarvestingLevel: 75
	},
	{
		item: BSOItem.SOUL_COLLECTOR_T4,
		levelToMake: 75,
		maxHarvestingLevel: 100
	},
	{
		item: BSOItem.SOUL_COLLECTOR_T5,
		levelToMake: 100,
		maxHarvestingLevel: 120
	}
] as const;
