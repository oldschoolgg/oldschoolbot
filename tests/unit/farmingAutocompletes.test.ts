import { convertLVLtoXP } from 'oldschooljs';
import { describe, expect, it } from 'vitest';

import './setup.js';

import {
	compostBinPlantNameAutoComplete,
	farmingPlantNameAutoComplete,
	titheFarmBuyRewardAutoComplete
} from '@/lib/skilling/skills/farming/autocompletes.js';
import { mockMUser } from './userutil.js';

describe('farming autocompletes', () => {
	it('farmingPlantNameAutoComplete respects farming level and search term', async () => {
		const highLevelUser = mockMUser({
			skills_farming: convertLVLtoXP(85)
		});
		const lowLevelUser = mockMUser({
			skills_farming: convertLVLtoXP(5)
		});

		const highLevelResults = await farmingPlantNameAutoComplete({ value: 'tree', user: highLevelUser } as any);
		const lowLevelResults = await farmingPlantNameAutoComplete({ value: 'tree', user: lowLevelUser } as any);

		expect(highLevelResults.some(option => option.name === 'Magic tree')).toBe(true);
		expect(lowLevelResults.some(option => option.name === 'Magic tree')).toBe(false);
	});

	it('farmingPlantNameAutoComplete returns empty array when no match is found', async () => {
		const user = mockMUser({
			skills_farming: convertLVLtoXP(80)
		});

		const results = await farmingPlantNameAutoComplete({ value: 'no-such-plant', user } as any);

		expect(results).toEqual([]);
	});

	it('titheFarmBuyRewardAutoComplete filters by name substring', async () => {
		const matching = await titheFarmBuyRewardAutoComplete({ value: 'seed' } as any);
		const nonMatching = await titheFarmBuyRewardAutoComplete({ value: 'not-a-buyable' } as any);

		expect(matching.some(option => option.name === 'Seed box')).toBe(true);
		expect(matching.every(option => option.name.toLowerCase().includes('seed'))).toBe(true);
		expect(nonMatching).toEqual([]);
	});

	it('compostBinPlantNameAutoComplete handles partial and missing input', async () => {
		const partial = await compostBinPlantNameAutoComplete({ value: 'pine' } as any);
		const empty = await compostBinPlantNameAutoComplete({ value: '' } as any);
		const none = await compostBinPlantNameAutoComplete({ value: 'not-compostable' } as any);

		expect(partial).toContainEqual({ name: 'Pineapple', value: 'Pineapple' });
		expect(empty.length).toBeGreaterThan(partial.length);
		expect(none).toEqual([]);
	});
});
