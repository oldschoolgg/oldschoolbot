import { Bank, convertLVLtoXP } from 'oldschooljs';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, type MockInstance, vi } from 'vitest';

import './setup.js';

import { autoFarm } from '../../src/lib/minions/functions/autoFarm.js';
import { prepareFarmingStep } from '../../src/lib/minions/functions/farmingTripHelpers.js';
import { plants } from '../../src/lib/skilling/skills/farming/index.js';
import type { FarmingPatchName } from '../../src/lib/skilling/skills/farming/utils/farmingHelpers.js';
import type { IPatchData, IPatchDataDetailed } from '../../src/lib/skilling/skills/farming/utils/types.js';
import addSubTaskToActivityTask from '../../src/lib/util/addSubTaskToActivityTask.js';
import * as calcMaxTripLengthModule from '../../src/lib/util/calcMaxTripLength.js';
import { mockMUser } from './userutil.js';
import '../../src/lib/util/clientSettings.js';

import type { MInteraction } from '../../src/lib/structures/MInteraction.js';
import { AutoFarmFilterEnum, CropUpgradeType } from '../../src/prisma/main/enums.js';
import type { User } from '../../src/prisma/main.js';

vi.mock('../../src/lib/util/addSubTaskToActivityTask.js', () => ({
	default: vi.fn()
}));

type Mutable<T> = { -readonly [K in keyof T]: T[K] };
type MutableUser = Mutable<User>;

const herbPlant = plants.find(p => p.name === 'Guam');
const treePlant = plants.find(p => p.name === 'Oak tree');

if (!herbPlant || !treePlant) {
	throw new Error('Expected Guam and Oak tree plants to exist for tests');
}

const herbPatch: IPatchData = {
	lastPlanted: null,
	patchPlanted: false,
	plantTime: Date.now(),
	lastQuantity: 0,
	lastUpgradeType: null,
	lastPayment: false
};

const herbPatchDetailed: IPatchDataDetailed = {
	...herbPatch,
	ready: null,
	readyIn: null,
	readyAt: null,
	patchName: herbPlant.seedType,
	friendlyName: 'Herb patch',
	plant: null
};

const treePatch: IPatchData = {
	lastPlanted: treePlant.name,
	patchPlanted: true,
	plantTime: Date.now(),
	lastQuantity: 3,
	lastUpgradeType: null,
	lastPayment: true
};

const treePatchDetailed: IPatchDataDetailed = {
	...treePatch,
	ready: true,
	readyIn: 0,
	readyAt: new Date(),
	patchName: treePlant.seedType,
	friendlyName: 'Tree patch',
	plant: treePlant
};

type FarmingTestInteraction = Pick<MInteraction, 'channelId'>;

const baseInteraction: FarmingTestInteraction = {
	channelId: '123'
};

const herbPatches: Partial<Record<FarmingPatchName, IPatchData>> = {
	[herbPlant.seedType]: herbPatch
};

const treePatches: Partial<Record<FarmingPatchName, IPatchData>> = {
	[treePlant.seedType]: treePatch
};

let calcMaxTripLengthSpy: MockInstance;
const originalPrisma = (globalThis as { prisma?: unknown }).prisma;
const originalMinionIsBusy = (global.ActivityManager as { minionIsBusy?: (userID: string) => boolean }).minionIsBusy;

beforeAll(() => {
	(global.ActivityManager as { minionIsBusy?: (userID: string) => boolean }).minionIsBusy = () => false;
	calcMaxTripLengthSpy = vi.spyOn(calcMaxTripLengthModule, 'calcMaxTripLength');
	(globalThis as { prisma?: unknown }).prisma = undefined;
});

afterAll(() => {
	calcMaxTripLengthSpy.mockRestore();
	(globalThis as { prisma?: unknown }).prisma = originalPrisma;
	(global.ActivityManager as { minionIsBusy?: (userID: string) => boolean }).minionIsBusy = originalMinionIsBusy;
});

beforeEach(() => {
	vi.clearAllMocks();
});

afterEach(() => {
	vi.useRealTimers();
	calcMaxTripLengthSpy.mockReset();
});

describe('auto farm helpers', () => {
	it('prepareFarmingStep replant respects last quantity and costs', async () => {
		const bank = new Bank().add('Acorn', 5).add('Supercompost', 5).add('Tomatoes(5)', 5).add('Coins', 10_000);
		const user = mockMUser({
			bank,
			skills_farming: convertLVLtoXP(40),
			skills_woodcutting: convertLVLtoXP(40)
		});
		const mutableUser = user.user as MutableUser;
		mutableUser.minion_defaultPay = true;
		mutableUser.minion_defaultCompostToUse = CropUpgradeType.supercompost;

		const result = await prepareFarmingStep({
			user,
			plant: treePlant,
			quantity: null,
			pay: false,
			patchDetailed: treePatchDetailed,
			maxTripLength: 3 * (20 + 5 + 10) * 1000,
			availableBank: user.bank.clone().add('Coins', user.GP),
			compostTier: CropUpgradeType.supercompost
		});

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}
		const { cost, quantity, duration, didPay, upgradeType, treeChopFee } = result.data;
		expect(quantity).toBe(treePatchDetailed.lastQuantity);
		expect(duration).toBe(treePatchDetailed.lastQuantity * (20 + 5 + 10) * 1000);
		expect(didPay).toBe(true);
		expect(upgradeType).toBe(CropUpgradeType.supercompost);
		expect(treeChopFee).toBe(200 * treePatchDetailed.lastQuantity);
		expect(cost.amount('Acorn')).toBe(treePatchDetailed.lastQuantity);
		expect(cost.amount('Supercompost')).toBe(treePatchDetailed.lastQuantity);
		expect(cost.amount('Tomatoes(5)')).toBe(treePatchDetailed.lastQuantity);
	});

	it('autoFarm generates plan for AllFarm filter', async () => {
		const bank = new Bank().add('Guam seed', 4).add('Compost', 4);
		const user = mockMUser({
			bank,
			skills_farming: convertLVLtoXP(50)
		});
		const mutableUser = user.user as MutableUser;
		mutableUser.auto_farm_filter = AutoFarmFilterEnum.AllFarm;
		mutableUser.minion_defaultCompostToUse = CropUpgradeType.compost;

		const transactResult = {
			newUser: user.user,
			itemsAdded: new Bank(),
			itemsRemoved: new Bank(),
			newBank: user.bank.clone(),
			newCL: user.cl.clone(),
			previousCL: new Bank()
		} satisfies Awaited<ReturnType<typeof user.transactItems>>;
		const transactSpy = vi.spyOn(user, 'transactItems').mockResolvedValue(transactResult);
		const statsSpy = vi.spyOn(user, 'statsBankUpdate').mockResolvedValue(undefined);
		const updateBankSettingSpy = vi.spyOn(global.ClientSettings, 'updateBankSetting').mockResolvedValue();

		calcMaxTripLengthSpy.mockReturnValue(300 * 1000);

		vi.useFakeTimers();
		vi.setSystemTime(new Date('2020-01-01T00:00:00Z'));

		const response = await autoFarm(
			user,
			[herbPatchDetailed],
			herbPatches as Record<FarmingPatchName, IPatchData>,
			baseInteraction as MInteraction
		);

		expect(typeof response).toBe('string');
		expect(response).toContain('auto farm the following patches');
		expect(response).toContain('4x Guam');

		expect(transactSpy).toHaveBeenCalledTimes(1);
		const [transactArg] = transactSpy.mock.calls[0];
		expect(transactArg.itemsToRemove).toBeDefined();
		const itemsToRemove = transactArg.itemsToRemove!;
		expect(itemsToRemove.amount('Guam seed')).toBe(4);
		expect(itemsToRemove.amount('Compost')).toBe(4);

		expect(statsSpy).toHaveBeenCalledWith('farming_plant_cost_bank', expect.any(Bank));
		expect(updateBankSettingSpy).toHaveBeenCalledWith('farming_cost_bank', expect.any(Bank));

		expect(addSubTaskToActivityTask).toHaveBeenCalledTimes(1);
		const taskArgs = (addSubTaskToActivityTask as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0];

		expect(taskArgs.autoFarmCombined).toBe(true);
		expect(taskArgs.autoFarmPlan).toHaveLength(1);
		expect(taskArgs.autoFarmPlan[0].plantsName).toBe(herbPlant.name);
		expect(taskArgs.autoFarmPlan[0].quantity).toBe(4);
		expect(taskArgs.autoFarmPlan[0].duration).toBe(4 * (20 + 5) * 1000);
		expect(taskArgs.autoFarmPlan[0].currentDate).toBe(new Date('2020-01-01T00:00:00Z').valueOf());
	});

	it('autoFarm replant respects last quantity, costs, and timing', async () => {
		const bank = new Bank().add('Acorn', 5).add('Supercompost', 5).add('Tomatoes(5)', 5).add('Coins', 10_000);
		const user = mockMUser({
			bank,
			skills_farming: convertLVLtoXP(40),
			skills_woodcutting: convertLVLtoXP(40)
		});
		const mutableUser = user.user as MutableUser;
		mutableUser.auto_farm_filter = AutoFarmFilterEnum.Replant;
		mutableUser.minion_defaultPay = true;
		mutableUser.minion_defaultCompostToUse = CropUpgradeType.supercompost;

		const transactResult = {
			newUser: user.user,
			itemsAdded: new Bank(),
			itemsRemoved: new Bank(),
			newBank: user.bank.clone(),
			newCL: user.cl.clone(),
			previousCL: new Bank()
		} satisfies Awaited<ReturnType<typeof user.transactItems>>;
		const transactSpy = vi.spyOn(user, 'transactItems').mockResolvedValue(transactResult);
		const statsSpy = vi.spyOn(user, 'statsBankUpdate').mockResolvedValue(undefined);
		const updateBankSettingSpy = vi.spyOn(global.ClientSettings, 'updateBankSetting').mockResolvedValue();

		calcMaxTripLengthSpy.mockReturnValue(3 * (20 + 5 + 10) * 1000);

		vi.useFakeTimers();
		vi.setSystemTime(new Date('2020-01-01T01:00:00Z'));

		const response = await autoFarm(
			user,
			[treePatchDetailed],
			treePatches as Record<FarmingPatchName, IPatchData>,
			baseInteraction as MInteraction
		);

		expect(typeof response).toBe('string');
		expect(response).toContain('3x Oak tree');
		expect(response).toContain('Up to 600 GP to remove previous trees');
		expect(response).toContain('3x Supercompost');
		expect(response).toContain('3x Tomatoes(5)');

		expect(transactSpy).toHaveBeenCalledTimes(1);
		const [transactArg] = transactSpy.mock.calls[0];
		expect(transactArg.itemsToRemove).toBeDefined();
		const itemsToRemove = transactArg.itemsToRemove!;
		expect(itemsToRemove.amount('Acorn')).toBe(3);
		expect(itemsToRemove.amount('Supercompost')).toBe(3);
		expect(itemsToRemove.amount('Tomatoes(5)')).toBe(3);

		expect(statsSpy).toHaveBeenCalledWith('farming_plant_cost_bank', expect.any(Bank));
		expect(updateBankSettingSpy).toHaveBeenCalledWith('farming_cost_bank', expect.any(Bank));

		expect(addSubTaskToActivityTask).toHaveBeenCalledTimes(1);
		const taskArgs = (addSubTaskToActivityTask as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0];
		expect(taskArgs.autoFarmPlan).toHaveLength(1);
		expect(taskArgs.autoFarmPlan[0].quantity).toBe(treePatchDetailed.lastQuantity);
		expect(taskArgs.autoFarmPlan[0].duration).toBe(treePatchDetailed.lastQuantity * (20 + 5 + 10) * 1000);
		expect(taskArgs.autoFarmPlan[0].treeChopFeePlanned).toBe(200 * treePatchDetailed.lastQuantity);
		expect(taskArgs.autoFarmPlan[0].currentDate).toBe(new Date('2020-01-01T01:00:00Z').valueOf());
	});
});
