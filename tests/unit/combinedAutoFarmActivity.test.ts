import { Bank } from 'oldschooljs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BitField } from '../../src/lib/constants.js';
import type { FarmingActivityTaskOptions } from '../../src/lib/types/minions.js';

const executeFarmingStepMock = vi.fn();
const handleTripFinishMock = vi.fn();
const makeAutoContractButtonMock = vi.fn().mockReturnValue('AUTO_BUTTON');
const canRunAutoContractMock = vi.fn();

vi.mock('@/tasks/minions/farmingStep.js', () => ({
	__esModule: true,
	executeFarmingStep: executeFarmingStepMock
}));
vi.mock('@/lib/util/handleTripFinish.js', () => ({
	__esModule: true,
	handleTripFinish: handleTripFinishMock
}));
vi.mock('@/lib/util/interactions.js', () => ({
	__esModule: true,
	makeAutoContractButton: makeAutoContractButtonMock
}));
vi.mock('@/mahoji/lib/abstracted_commands/farmingContractCommand.js', () => ({
	__esModule: true,
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
		vi.stubGlobal('prisma', {
			farmedCrop: {
				create: vi.fn().mockResolvedValue({ id: 123 })
			}
		});
		vi.stubGlobal('ClientSettings', {
			updateBankSetting: vi.fn().mockResolvedValue(undefined)
		});

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
			hasEquippedOrInBank: vi.fn().mockReturnValue(false),
			skillsAsLevels: {
				farming: 99,
				woodcutting: 99,
				herblore: 99
			},
			addXP: vi.fn().mockResolvedValue(''),
			transactItems: vi.fn().mockResolvedValue(undefined),
			update: vi.fn().mockResolvedValue(undefined),
			statsBankUpdate: vi.fn().mockResolvedValue(undefined),
			farmingContract: vi.fn().mockReturnValue({ contract: null }),
			toString() {
				return 'AutoFarmer';
			}
		} as MUserStub;

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

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('relies on handleTripFinish when auto contract is available', async () => {
		canRunAutoContractMock.mockResolvedValue(true);

		await handleCombinedAutoFarm({ user: user as any, taskData });

		expect(executeFarmingStepMock).toHaveBeenCalledTimes(1);
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
	hasEquippedOrInBank: ReturnType<typeof vi.fn>;
	skillsAsLevels: {
		farming: number;
		woodcutting: number;
		herblore: number;
	};
	addXP: ReturnType<typeof vi.fn>;
	transactItems: ReturnType<typeof vi.fn>;
	update: ReturnType<typeof vi.fn>;
	statsBankUpdate: ReturnType<typeof vi.fn>;
	farmingContract: ReturnType<typeof vi.fn>;
	toString(): string;
};
