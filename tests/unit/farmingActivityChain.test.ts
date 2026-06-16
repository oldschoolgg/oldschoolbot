import type { RNGProvider } from 'node-rng';
import { Bank } from 'oldschooljs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import './setup.js';

import type { IPatchData } from '../../src/lib/skilling/skills/farming/utils/types.js';
import type { AutoFarmStepData, FarmingActivityTaskOptions } from '../../src/lib/types/minions.js';
import { farmingTask } from '../../src/tasks/minions/farmingActivity.js';
import * as farmingStepModule from '../../src/tasks/minions/farmingStep.js';
import { mockMUser } from './userutil.js';

describe('farmingActivity auto farm chain', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('queues next step without pre-creating a farmedCrop row', async () => {
		const user = mockMUser({ id: '123' });
		const basePatch: IPatchData = {
			lastPlanted: 'Guam',
			patchPlanted: true,
			plantTime: Date.now(),
			lastQuantity: 4,
			lastUpgradeType: null,
			lastPayment: true
		};
		const nextStep: AutoFarmStepData = {
			plantsName: 'Watermelon',
			quantity: 8,
			upgradeType: null,
			payment: false,
			treeChopFeePaid: 0,
			treeChopFeePlanned: 0,
			patchType: basePatch,
			planting: true,
			currentDate: Date.now() + 60_000,
			duration: 60_000
		};

		vi.spyOn(farmingStepModule, 'executeFarmingStep').mockResolvedValue({
			message: 'First step complete',
			loot: new Bank().add('Seed pack', 1),
			summary: {
				duration: 60_000,
				xp: {
					planting: 0,
					harvest: 0,
					checkHealth: 0,
					rake: 0,
					bonus: 0,
					totalFarming: 0,
					woodcutting: 0,
					herblore: 0
				},
				xpMessages: {}
			}
		});

		const originalPrisma = (globalThis as { prisma?: unknown }).prisma;
		const activityCountSpy = vi.fn().mockResolvedValue(0);
		const activityCreateSpy = vi.fn().mockResolvedValue({ id: 1 });
		const createSpy = vi.fn();
		(globalThis as { prisma?: unknown }).prisma = {
			activity: {
				count: activityCountSpy,
				create: activityCreateSpy
			},
			farmedCrop: {
				create: createSpy
			}
		};

		const data: FarmingActivityTaskOptions = {
			type: 'Farming',
			userID: user.id,
			channelId: '123',
			id: 1,
			finishDate: Date.now() + 60_000,
			plantsName: 'Guam',
			patchType: basePatch,
			quantity: 4,
			upgradeType: null,
			payment: false,
			treeChopFeePaid: 0,
			treeChopFeePlanned: 0,
			planting: true,
			duration: 60_000,
			currentDate: Date.now(),
			autoFarmed: true,
			autoFarmPlan: [nextStep],
			autoFarmCombined: true
		};

		const rng: RNGProvider = {
			roll: () => false,
			randInt: () => 1,
			randFloat: () => 0,
			rand: () => 0,
			shuffle: <T>(arr: T[]) => arr,
			pick: <T>(arr: T[]) => arr[0],
			percentChance: () => false,
			randomVariation: (value: number) => value
		};

		try {
			await farmingTask.run(data, {
				user,
				handleTripFinish: vi.fn().mockResolvedValue(undefined),
				rng
			});

			expect(activityCountSpy).toHaveBeenCalledTimes(1);
			expect(activityCreateSpy).toHaveBeenCalledTimes(1);
			expect(createSpy).not.toHaveBeenCalled();
		} finally {
			(globalThis as { prisma?: unknown }).prisma = originalPrisma;
		}
	});
});
