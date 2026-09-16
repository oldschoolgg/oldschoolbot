import { Time } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import './setup.js';

import type { IPatchData } from '../../src/lib/skilling/skills/farming/utils/types.js';
import type { AutoFarmStepData, FarmingActivityTaskOptions } from '../../src/lib/types/minions.js';
import * as handleTripFinishModule from '../../src/lib/util/handleTripFinish.js';
import { farmingTask } from '../../src/tasks/minions/farmingActivity.js';
import type { FarmingStepSummary } from '../../src/tasks/minions/farmingStep.js';
import * as farmingStepModule from '../../src/tasks/minions/farmingStep.js';
import { createTestUser, mockClient } from './util.js';

vi.mock('@/lib/util/makeBankImage.js', () => ({
	makeBankImage: vi.fn(async () => ({ name: 'bank.png', buffer: Buffer.from('bank') }))
}));

describe('farming task auto farm sequencing', () => {
	beforeEach(async () => {
		await mockClient();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	async function runAutoFarmScenario({
		combinedMode = false,
		watermelonAlive = 8,
		includeArcaneHarvesterBoosts = false
	}: {
		combinedMode?: boolean;
		watermelonAlive?: number;
		includeArcaneHarvesterBoosts?: boolean;
	} = {}) {
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
				patchName: 'herb',
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
				patchName: 'allotment',
				payment: false,
				treeChopFeePaid: 0,
				treeChopFeePlanned: 0,
				patchType: basePatch,
				planting: false,
				currentDate: Date.now() + Time.Minute,
				duration: Time.Minute
			}
		];
		if (includeArcaneHarvesterBoosts) {
			plan.push({
				plantsName: 'Yew',
				quantity: 5,
				upgradeType: null,
				patchName: 'tree',
				payment: false,
				treeChopFeePaid: 0,
				treeChopFeePlanned: 0,
				patchType: basePatch,
				planting: false,
				currentDate: Date.now() + Time.Minute * 2,
				duration: Time.Minute
			});
		}

		const arcaneHarvesterBoosts = [
			'100% bonus yield from Arcane Harvester (Removed 15x Magic, 15x Organic)',
			'100% bonus yield from Arcane Harvester (Removed 10x Magic, 10x Organic)',
			'100% bonus yield from Arcane Harvester (Removed 5x Magic, 5x Organic)'
		];

		const summaries: FarmingStepSummary[] = [
			{
				planted: { itemName: 'Guam seed', quantity: 6 },
				harvested: { itemName: 'Guam', quantity: 4, alive: 4, died: 0 },
				duration: Time.Minute,
				xp: {
					totalFarming: 104,
					woodcutting: 0,
					herblore: 0,
					planting: 0,
					harvest: 0,
					checkHealth: 0,
					rake: 0,
					bonus: 4
				},
				xpMessages: {
					farming:
						'You received 104 Farming XP. You received 8% bonus XP for having a Farming master cape. (6k/Hr)'
				},
				boosts: ['Graceful', ...(includeArcaneHarvesterBoosts ? [arcaneHarvesterBoosts[0]] : [])],
				contractCompleted: true,
				payNote: 'Paid 3x Tomatoes to keep the farmers happy.'
			},
			{
				harvested: { itemName: 'Watermelon', quantity: 8, alive: watermelonAlive, died: 8 - watermelonAlive },
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
				boosts: ['Graceful', ...(includeArcaneHarvesterBoosts ? [arcaneHarvesterBoosts[1]] : [])]
			}
		];
		if (includeArcaneHarvesterBoosts) {
			summaries.push({
				harvested: { itemName: 'Yew roots', quantity: 5, alive: 5, died: 0 },
				duration: Time.Minute,
				xp: {
					totalFarming: 300,
					woodcutting: 0,
					herblore: 0,
					planting: 0,
					harvest: 0,
					checkHealth: 0,
					rake: 0,
					bonus: 0
				},
				xpMessages: {},
				boosts: ['Graceful', arcaneHarvesterBoosts[2]]
			});
		}

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
		if (includeArcaneHarvesterBoosts) {
			results.push({
				message: 'Third step complete',
				loot: new Bank().add('Yew roots', 5),
				summary: summaries[2]
			});
		}

		const executeSpy = vi.spyOn(farmingStepModule, 'executeFarmingStep').mockImplementation(async () => {
			const result = results.shift();
			if (!result) {
				throw new Error('No farming step result available');
			}
			return result;
		});

		const handleTripFinishSpy = vi.spyOn(handleTripFinishModule, 'handleTripFinish').mockResolvedValue();

		const taskData: FarmingActivityTaskOptions = {
			type: 'Farming',
			userID: user.id,
			channelId: 'test-channel-id',
			id: 123,
			finishDate: Date.now(),
			plantsName: plan[0].plantsName,
			patchType: basePatch,
			quantity: plan[0].quantity,
			upgradeType: plan[0].upgradeType,
			payment: plan[0].payment,
			treeChopFeePaid: plan[0].treeChopFeePaid,
			treeChopFeePlanned: plan[0].treeChopFeePlanned,
			planting: plan[0].planting,
			duration: combinedMode ? Time.Minute * 2 : plan[0].duration,
			currentDate: plan[0].currentDate,
			autoFarmed: true,
			autoFarmPlan: combinedMode ? plan : plan.slice(1),
			autoFarmCombined: combinedMode
		};

		const runOptions: {
			user: typeof user;
			handleTripFinish: typeof handleTripFinishModule.handleTripFinish;
			rng: RNGProvider;
		} = {
			user,
			handleTripFinish: handleTripFinishModule.handleTripFinish,
			rng: {
				roll: () => false,
				randInt: () => 0,
				randFloat: () => 0,
				rand: () => 0,
				shuffle: <T>(array: T[]) => array,
				pick: <T>(array: T[]) => array[0],
				percentChance: () => false,
				randomVariation: (value: number) => value
			}
		};

		await farmingTask.run(taskData, runOptions);

		return {
			user,
			executeSpy,
			handleTripFinishSpy
		};
	}

	it('keeps normal farming completion when not combined', async () => {
		const { user, executeSpy, handleTripFinishSpy } = await runAutoFarmScenario();

		expect(executeSpy).toHaveBeenCalledTimes(1);
		expect(handleTripFinishSpy).toHaveBeenCalledTimes(1);

		const firstCallData = executeSpy.mock.calls[0]?.[0]?.data as FarmingActivityTaskOptions | undefined;

		expect(firstCallData?.plantsName).toBe('Guam');
		expect(firstCallData?.patchType.lastPlanted).toBe('Guam');

		expect(user.minionName).toBeDefined();
	});

	it('processes combined auto farm patches inside one task', async () => {
		const { executeSpy, handleTripFinishSpy } = await runAutoFarmScenario({
			combinedMode: true
		});

		expect(executeSpy).toHaveBeenCalledTimes(2);
		expect(handleTripFinishSpy).toHaveBeenCalledTimes(1);

		const firstCallData = executeSpy.mock.calls[0]?.[0]?.data as FarmingActivityTaskOptions | undefined;
		const secondCallData = executeSpy.mock.calls[1]?.[0]?.data as FarmingActivityTaskOptions | undefined;

		expect(firstCallData?.plantsName).toBe('Guam');
		expect(firstCallData?.duration).toBe(Time.Minute);
		expect(secondCallData?.plantsName).toBe('Watermelon');
		expect(secondCallData?.duration).toBe(Time.Minute);
	});

	it('combines auto farm messaging when requested', async () => {
		const { executeSpy, handleTripFinishSpy } = await runAutoFarmScenario({
			combinedMode: true
		});

		expect(executeSpy).toHaveBeenCalledTimes(2);
		expect(handleTripFinishSpy).toHaveBeenCalledTimes(1);

		const finalCall = handleTripFinishSpy.mock.calls[0]?.[0] as
			| { message?: string | { content?: string; files?: SendableFile[] }; loot?: Bank | null }
			| undefined;
		const messageContent =
			typeof finalCall?.message === 'string' ? finalCall.message : (finalCall?.message?.content ?? '');

		expect(messageContent).not.toContain('Seed pack');
		expect(messageContent).toContain('Woodcutting 100 XP (3k/Hr)');
		expect(messageContent).toContain('Farming 304 XP (9k/Hr, +4 bonus)');
		expect(messageContent).toContain("You received an additional 4 bonus XP from your farmer's outfit.");
		expect(messageContent).toContain('You received 8% bonus XP for having a Farming master cape.');
		expect(messageContent).not.toContain('**Crop deaths:**');
		expect(messageContent).not.toContain('**Total loot:**');
		expect(messageContent).not.toContain('**Patches farmed:**');
		expect(messageContent).toContain('**Boosts:** Graceful.');
		expect(typeof finalCall?.message === 'string' ? [] : finalCall?.message?.files).toHaveLength(1);

		const finalLoot = finalCall?.loot;
		expect(finalLoot?.has('Seed pack')).toBe(true);
		expect(finalLoot?.has('Watermelon')).toBe(true);
	});

	it('only lists crop deaths when crops died', async () => {
		const { handleTripFinishSpy } = await runAutoFarmScenario({
			combinedMode: true,
			watermelonAlive: 6
		});

		const finalCall = handleTripFinishSpy.mock.calls[0]?.[0] as
			| { message?: string | { content?: string; files?: SendableFile[] } }
			| undefined;
		const messageContent =
			typeof finalCall?.message === 'string' ? finalCall.message : (finalCall?.message?.content ?? '');

		expect(messageContent).toContain('**Crop deaths:** Watermelon: 2 died.');
		expect(messageContent).not.toContain('Guam');
		expect(messageContent).not.toContain('6/8 survived');
	});

	it('combines Arcane Harvester boost costs in auto farm messaging', async () => {
		const { executeSpy, handleTripFinishSpy } = await runAutoFarmScenario({
			combinedMode: true,
			includeArcaneHarvesterBoosts: true
		});

		expect(executeSpy).toHaveBeenCalledTimes(3);

		const finalCall = handleTripFinishSpy.mock.calls[0]?.[0] as
			| { message?: string | { content?: string; files?: SendableFile[] } }
			| undefined;
		const messageContent =
			typeof finalCall?.message === 'string' ? finalCall.message : (finalCall?.message?.content ?? '');

		expect(messageContent).toContain('100% bonus yield from Arcane Harvester (Removed 30x Magic, 30x Organic)');
		expect(messageContent).not.toContain('Removed 15x Magic, 15x Organic');
		expect(messageContent).not.toContain('Removed 10x Magic, 10x Organic');
		expect(messageContent).not.toContain('Removed 5x Magic, 5x Organic');
	});
});
