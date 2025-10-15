import { Time } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import './setup.js';

import type { IPatchData } from '../../src/lib/skilling/skills/farming/utils/types.js';
import type { AutoFarmStepData, FarmingActivityTaskOptions } from '../../src/lib/types/minions.js';
import * as handleTripFinishModule from '../../src/lib/util/handleTripFinish.js';
import * as farmingContractModule from '../../src/mahoji/lib/abstracted_commands/farmingContractCommand.js';
import { farmingTask } from '../../src/tasks/minions/farmingActivity.js';
import * as farmingStepModule from '../../src/tasks/minions/farmingStep.js';
import { createTestUser, mockClient, TEST_CHANNEL_ID } from './util.js';

vi.mock('../../src/lib/util/webhook', () => ({
	sendToChannelID: vi.fn()
}));

describe('farming task auto farm aggregation', () => {
	beforeEach(async () => {
		await mockClient();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('aggregates summaries and adds auto contract button when applicable', async () => {
		const user = await createTestUser();

		const basePatch: IPatchData = {
			lastPlanted: 'Guam',
			patchPlanted: true,
			plantTime: Date.now(),
			lastQuantity: 4,
			lastUpgradeType: null,
			lastPayment: true
		};

		const plan: AutoFarmStepData[] = [
			{
				plantsName: 'Guam',
				quantity: 4,
				upgradeType: null,
				payment: true,
				treeChopFeePaid: 0,
				treeChopFeePlanned: 0,
				patchType: basePatch,
				planting: true,
				currentDate: Date.now(),
				duration: Time.Minute
			},
			{
				plantsName: 'Watermelon',
				quantity: 8,
				upgradeType: null,
				payment: false,
				treeChopFeePaid: 0,
				treeChopFeePlanned: 0,
				patchType: basePatch,
				planting: false,
				currentDate: Date.now() + Time.Minute,
				duration: Time.Minute
			}
		];

		const summaries = [
			{
				planted: { itemName: 'Guam seed', quantity: 4 },
				duration: Time.Minute,
				xp: {
					totalFarming: 100,
					woodcutting: 0,
					herblore: 0,
					planting: 0,
					harvest: 0,
					checkHealth: 0,
					rake: 0,
					bonus: 0
				},
				xpMessages: { farming: 'You received 50 XP\nTake care of your plants.' },
				boosts: ['Graceful'],
				contractCompleted: true,
				payNote: 'Paid 3x Tomatoes to keep the farmers happy.'
			},
			{
				harvested: { itemName: 'Watermelon', quantity: 8, alive: 8, died: 0 },
				duration: Time.Minute,
				xp: {
					totalFarming: 200,
					woodcutting: 100,
					herblore: 50,
					planting: 0,
					harvest: 0,
					checkHealth: 0,
					rake: 0,
					bonus: 0
				},
				xpMessages: { herblore: 'You received 25 XP', woodcutting: 'Keep chopping!' },
				boosts: ['Graceful']
			}
		];

		const results = [
			{
				message: 'First step complete',
				loot: new Bank().add('Seed pack', 1),
				summary: summaries[0]
			},
			{
				message: 'Second step complete',
				loot: new Bank().add('Watermelon', 8),
				summary: summaries[1]
			}
		];

		const executeSpy = vi.spyOn(farmingStepModule, 'executeFarmingStep').mockImplementation(async () => {
			const result = results.shift();
			if (!result) {
				throw new Error('No farming step result available');
			}
			return result;
		});

		const handleTripFinishSpy = vi.spyOn(handleTripFinishModule, 'handleTripFinish').mockResolvedValue();
		const canRunAutoContractSpy = vi.spyOn(farmingContractModule, 'canRunAutoContract').mockResolvedValue(false);

		const taskData: FarmingActivityTaskOptions = {
			type: 'Farming',
			userID: user.id,
			channelID: TEST_CHANNEL_ID,
			plantsName: plan[0].plantsName,
			patchType: basePatch,
			quantity: plan[0].quantity,
			upgradeType: plan[0].upgradeType,
			payment: plan[0].payment,
			treeChopFeePaid: plan[0].treeChopFeePaid,
			treeChopFeePlanned: plan[0].treeChopFeePlanned,
			planting: plan[0].planting,
			duration: plan[0].duration,
			currentDate: plan[0].currentDate,
			autoFarmed: true,
			autoFarmPlan: plan,
			autoFarmCombined: true
		};

		await farmingTask.run(taskData);

		expect(executeSpy).toHaveBeenCalledTimes(2);
		expect(handleTripFinishSpy).toHaveBeenCalledTimes(1);
		expect(canRunAutoContractSpy).toHaveBeenCalledTimes(1);

		const [, , message, , , loot, , extraComponents] = handleTripFinishSpy.mock.calls[0];
		expect(typeof message).toBe('string');
		const content = message as string;
		expect(content).toContain(`${user}, ${user.minionName} finished auto farming your patches.`);
		expect(content).toContain('Your minion planted 4x Guam seed.');
		expect(content).toContain('You harvested 8x Watermelon.');
		expect(content).toContain('You received 300');
		expect(content).toContain('100');
		expect(content).toContain('50');
		expect(content).toContain('**Boosts:** Graceful.');
		expect(content).toContain('Completed 1 farming contract.');
		expect(content).toContain('You received:');
		expect(content).toContain('Seed pack');
		expect(content).toContain('Watermelon');
		expect(content).toContain('Paid 3x Tomatoes');
		expect(content).toContain('Take care of your plants.');
		expect(content).toContain('Keep chopping!');

		expect((loot as Bank).has('Seed pack')).toBe(true);
		expect((loot as Bank).has('Watermelon')).toBe(true);

		expect(extraComponents).toBeDefined();
		expect(extraComponents).toHaveLength(1);
		expect(extraComponents![0].toJSON().custom_id).toBe('AUTO_FARMING_CONTRACT');
	});
});
