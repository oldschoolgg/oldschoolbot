import { Time } from '@oldschoolgg/toolkit';
import { describe, expect, it, vi } from 'vitest';

import './setup.js';

import { plants } from '@/lib/skilling/skills/farming/index.js';
import { getFarmingInfoFromUser } from '@/lib/skilling/skills/farming/utils/getFarmingInfo.js';
import { mockMUser } from './userutil.js';

const guamPlant = plants.find(plant => plant.name === 'Guam');
if (!guamPlant) {
	throw new Error('Expected Guam plant to exist for getFarmingInfo tests');
}

describe('getFarmingInfoFromUser', () => {
	it('returns default patch info for unset patches', () => {
		const user = mockMUser();
		const { patches, patchesDetailed } = getFarmingInfoFromUser(user);

		expect(patches.herb.patchPlanted).toBe(false);
		expect(patches.herb.lastPlanted).toBeNull();
		const herbPatch = patchesDetailed.find(patch => patch.patchName === 'herb');
		expect(herbPatch).toBeDefined();
		expect(herbPatch?.ready).toBeNull();
		expect(herbPatch?.readyAt).toBeNull();
		expect(herbPatch?.readyIn).toBeNull();

		const fruitTreePatch = patchesDetailed.find(patch => patch.patchName === 'fruit_tree');
		expect(fruitTreePatch?.friendlyName).toBe('Fruit Tree');
	});

	it('marks planted patch as ready when growth time has passed', () => {
		vi.useFakeTimers();
		const now = new Date('2026-01-01T00:00:00Z');
		vi.setSystemTime(now);

		const user = mockMUser();
		(user.user as any).farmingPatches_herb = {
			lastPlanted: guamPlant.name,
			patchPlanted: true,
			plantTime: now.getTime() - guamPlant.growthTime * Time.Minute - Time.Minute,
			lastQuantity: 1,
			lastUpgradeType: null,
			lastPayment: false
		};

		const { patchesDetailed } = getFarmingInfoFromUser(user);
		const herbPatch = patchesDetailed.find(patch => patch.patchName === 'herb');

		expect(herbPatch?.plant?.name).toBe('Guam');
		expect(herbPatch?.ready).toBe(true);
		expect((herbPatch?.readyIn ?? 1) <= 0).toBe(true);
		expect(herbPatch?.readyAt).not.toBeNull();
	});

	it('marks planted patch as growing when growth time has not passed', () => {
		vi.useFakeTimers();
		const now = new Date('2026-01-01T00:00:00Z');
		vi.setSystemTime(now);

		const user = mockMUser();
		(user.user as any).farmingPatches_herb = {
			lastPlanted: guamPlant.name,
			patchPlanted: true,
			plantTime: now.getTime() - guamPlant.growthTime * Time.Minute + Time.Minute,
			lastQuantity: 1,
			lastUpgradeType: null,
			lastPayment: false
		};

		const { patchesDetailed } = getFarmingInfoFromUser(user);
		const herbPatch = patchesDetailed.find(patch => patch.patchName === 'herb');

		expect(herbPatch?.ready).toBe(false);
		expect((herbPatch?.readyIn ?? 0) > 0).toBe(true);
		expect(herbPatch?.readyAt).not.toBeNull();
	});

	it('throws when a patch references an unknown plant name', () => {
		const user = mockMUser();
		(user.user as any).farmingPatches_herb = {
			lastPlanted: 'Definitely Not A Plant',
			patchPlanted: true,
			plantTime: Date.now(),
			lastQuantity: 1,
			lastUpgradeType: null,
			lastPayment: false
		};

		expect(() => getFarmingInfoFromUser(user)).toThrow('No plant found for Definitely Not A Plant');
	});
});
