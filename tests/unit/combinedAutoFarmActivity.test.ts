import { Bank } from 'oldschooljs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BitField } from '../../src/lib/constants.js';
import type { FarmingActivityTaskOptions } from '../../src/lib/types/minions.js';

const executeFarmingStepMock = vi.fn();
const handleTripFinishMock = vi.fn();
const makeAutoContractButtonMock = vi.fn().mockReturnValue('AUTO_BUTTON');
const canRunAutoContractMock = vi.fn();

vi.mock('../../src/tasks/minions/farmingStep.js', () => ({
	executeFarmingStep: executeFarmingStepMock
}));
vi.mock('../../src/lib/util/handleTripFinish.js', () => ({
	handleTripFinish: handleTripFinishMock
}));
vi.mock('../../src/lib/util/interactions.js', () => ({
	makeAutoContractButton: makeAutoContractButtonMock
}));
vi.mock('../../src/mahoji/lib/abstracted_commands/farmingContractCommand.js', () => ({
	canRunAutoContract: canRunAutoContractMock
}));

const { handleCombinedAutoFarm } = await import('../../src/tasks/minions/combinedAutoFarmActivity.js');

describe('handleCombinedAutoFarm auto contract button behaviour', () => {
	let user: MUserStub;
	let taskData: FarmingActivityTaskOptions;

	beforeEach(() => {
		executeFarmingStepMock.mockReset();
		handleTripFinishMock.mockReset();
		makeAutoContractButtonMock.mockReset().mockReturnValue('AUTO_BUTTON');
		canRunAutoContractMock.mockReset();

		executeFarmingStepMock.mockResolvedValue({
			message: 'finished step',
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
				xpMessages: {},
				contractCompleted: true
			}
		});

		user = {
			id: '1',
			bitfield: [] as number[],
			minionName: 'AutoFarmer',
			toString() {
				return 'AutoFarmer';
			}
		};

		taskData = {
			type: 'Farming',
			plantsName: 'Test herb',
			patchType: {} as any,
			userID: '1',
			channelID: '123',
			quantity: 1,
			upgradeType: null,
			payment: false,
			treeChopFeePaid: 0,
			treeChopFeePlanned: 0,
			planting: true,
			duration: 60_000,
			currentDate: Date.now(),
			finishDate: Date.now() + 60_000,
			autoFarmed: true,
			autoFarmPlan: [
				{
					plantsName: 'Test herb',
					quantity: 1,
					upgradeType: null,
					payment: false,
					treeChopFeePaid: 0,
					treeChopFeePlanned: 0,
					patchType: {} as any,
					planting: true,
					currentDate: Date.now(),
					duration: 60_000
				}
			]
		} as FarmingActivityTaskOptions;
	});

	it('relies on handleTripFinish when auto contract is available', async () => {
		canRunAutoContractMock.mockResolvedValue(true);

		await handleCombinedAutoFarm({ user: user as any, taskData });

		expect(handleTripFinishMock).toHaveBeenCalledTimes(1);
		const extraComponents = handleTripFinishMock.mock.calls[0]?.[7];
		expect(extraComponents).toBeUndefined();
		expect(makeAutoContractButtonMock).not.toHaveBeenCalled();
	});

	it('adds auto contract button when contract completed but auto contract unavailable', async () => {
		canRunAutoContractMock.mockResolvedValue(false);

		await handleCombinedAutoFarm({ user: user as any, taskData });

		const extraComponents = handleTripFinishMock.mock.calls[0]?.[7];
		expect(extraComponents).toEqual(['AUTO_BUTTON']);
		expect(makeAutoContractButtonMock).toHaveBeenCalledTimes(1);
	});

	it('respects the disable auto contract button bitfield', async () => {
		canRunAutoContractMock.mockResolvedValue(false);
		user.bitfield = [BitField.DisableAutoFarmContractButton];

		await handleCombinedAutoFarm({ user: user as any, taskData });

		const extraComponents = handleTripFinishMock.mock.calls[0]?.[7];
		expect(extraComponents).toBeUndefined();
		expect(makeAutoContractButtonMock).not.toHaveBeenCalled();
	});
});

type MUserStub = {
	id: string;
	bitfield: number[];
	minionName: string;
	toString(): string;
};
