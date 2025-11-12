import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, type MockInstance, vi } from 'vitest';
import './setup.js';

import { Bank, convertLVLtoXP, itemID } from 'oldschooljs';

import { autoFarm } from '../../src/lib/minions/functions/autoFarm.js';
import { resolveSeedForPatch } from '../../src/lib/minions/functions/autoFarmPreferences.js';
import { prepareFarmingStep } from '../../src/lib/minions/functions/farmingTripHelpers.js';
import { plants } from '../../src/lib/skilling/skills/farming/index.js';
import type { FarmingPatchName } from '../../src/lib/skilling/skills/farming/utils/farmingHelpers.js';
import type {
	FarmingSeedPreference,
	IPatchData,
	IPatchDataDetailed
} from '../../src/lib/skilling/skills/farming/utils/types.js';
import addSubTaskToActivityTask from '../../src/lib/util/addSubTaskToActivityTask.js';
import * as calcMaxTripLengthModule from '../../src/lib/util/calcMaxTripLength.js';
import { mockMUser } from './userutil.js';
import '../../src/lib/util/clientSettings.js';

import { Emoji } from '@oldschoolgg/toolkit';
import { ButtonStyle } from 'discord.js';

import { fetchRepeatTrips, repeatTrip } from '@/lib/util/repeatStoredTrip.js';
import type { MInteraction } from '../../src/lib/structures/MInteraction.js';
import { AutoFarmFilterEnum, activity_type_enum, CropUpgradeType } from '../../src/prisma/main/enums.js';
import type { User } from '../../src/prisma/main.js';

vi.mock('../../src/lib/util/addSubTaskToActivityTask.js', () => ({
	default: vi.fn()
}));

vi.mock('../../src/lib/util/repeatStoredTrip.js', () => ({
	fetchRepeatTrips: vi.fn().mockResolvedValue([]),
	repeatTrip: vi.fn()
}));

type Mutable<T> = { -readonly [K in keyof T]: T[K] };
type MutableUser = Mutable<User>;

type ButtonJSON = {
	type: number;
	style: number;
	label?: string;
	custom_id?: string;
	emoji?: { name?: string; id?: string | null };
};

type ActionRowJSON = {
	type: number;
	components: ButtonJSON[];
};

function isBaseMessage(value: unknown): value is {
	content?: string;
	components?: any[];
} {
	return typeof value === 'object' && value !== null && !('type' in (value as any));
}

// plants we need
const herbPlant = plants.find(p => p.name === 'Guam');
const treePlant = plants.find(p => p.name === 'Oak tree');
const ranarrPlant = plants.find(p => p.name === 'Ranarr');

if (!herbPlant || !treePlant || !ranarrPlant) {
	throw new Error('Expected Guam, Ranarr, and Oak tree plants to exist for tests');
}

const [herbSeedItem] = herbPlant.inputItems.items();
if (!herbSeedItem) {
	throw new Error('Expected Guam plant to have a seed input item');
}
const herbSeedID = herbSeedItem[0].id;

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

const herbPatchReadyDetailed: IPatchDataDetailed = {
	...herbPatch,
	ready: true,
	readyIn: 0,
	readyAt: new Date(),
	patchName: herbPlant.seedType,
	friendlyName: 'Herb patch',
	plant: herbPlant
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
const originalMinionIsBusy = (global.ActivityManager as { minionIsBusy?: (userID: string) => boolean }).minionIsBusy;

beforeAll(() => {
	(global.ActivityManager as { minionIsBusy?: (userID: string) => boolean }).minionIsBusy = () => false;
	calcMaxTripLengthSpy = vi.spyOn(calcMaxTripLengthModule, 'calcMaxTripLength');
});

afterAll(() => {
	calcMaxTripLengthSpy.mockRestore();
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
	it('autoFarm includes check patches button when no crops are available', async () => {
		const user = mockMUser({
			bank: new Bank(),
			skills_farming: convertLVLtoXP(1)
		});
		const mutableUser = user.user as MutableUser;
		mutableUser.auto_farm_filter = AutoFarmFilterEnum.AllFarm;

		calcMaxTripLengthSpy.mockReturnValue(5 * 60 * 1000);

		const response = await autoFarm(
			user,
			[],
			{} as Record<FarmingPatchName, IPatchData>,
			baseInteraction as MInteraction
		);

		if (!isBaseMessage(response)) {
			throw new Error('Expected BaseMessageOptions-like response');
		}

		expect(fetchRepeatTrips).toHaveBeenCalledTimes(1);
		expect(repeatTrip).not.toHaveBeenCalled();

		expect(response.content).toBe(
			"There's no Farming crops that you have the requirements to plant, and nothing to harvest."
		);

		expect(response.components).toBeDefined();
		const components = response.components ?? [];

		const rowMaybe = components[0] as any;

		let rowJSON: ActionRowJSON;
		if (rowMaybe && typeof rowMaybe.toJSON === 'function') {
			rowJSON = rowMaybe.toJSON() as ActionRowJSON;
		} else if (rowMaybe && typeof rowMaybe === 'object' && 'components' in rowMaybe) {
			rowJSON = rowMaybe as ActionRowJSON;
		} else {
			throw new Error('Unexpected row component type: expected builder or API row with components[]');
		}

		expect(rowJSON.components).toHaveLength(1);

		const buttonMaybe = rowJSON.components[0] as any;
		const buttonJSON: ButtonJSON =
			buttonMaybe && typeof buttonMaybe.toJSON === 'function'
				? (buttonMaybe.toJSON() as ButtonJSON)
				: (buttonMaybe as ButtonJSON);

		expect(buttonJSON.style).toBe(ButtonStyle.Secondary);
		expect(buttonJSON.custom_id).toBe('CHECK_PATCHES');
		expect(buttonJSON.label).toBe('Check Patches');
		expect(buttonJSON.emoji?.name).toBe(Emoji.Stopwatch);
	});

	it('autoFarm attempts to repeat previous trip when available', async () => {
		const user = mockMUser({
			bank: new Bank(),
			skills_farming: convertLVLtoXP(1)
		});
		const mutableUser = user.user as MutableUser;
		mutableUser.auto_farm_filter = AutoFarmFilterEnum.Replant;

		const repeatTripsMock = fetchRepeatTrips as unknown as MockInstance;
		const repeatTripMock = repeatTrip as unknown as MockInstance;
		repeatTripsMock.mockResolvedValueOnce([{ type: activity_type_enum.ClueCompletion, data: {} }]);
		repeatTripMock.mockResolvedValueOnce('Resuming previous trip');

		calcMaxTripLengthSpy.mockReturnValue(5 * 60 * 1000);

		const response = await autoFarm(
			user,
			[],
			{} as Record<FarmingPatchName, IPatchData>,
			baseInteraction as MInteraction
		);

		expect(fetchRepeatTrips).toHaveBeenCalledTimes(1);
		expect(repeatTrip).toHaveBeenCalledTimes(1);
		expect(response).toBe(
			"There's no Farming crops that you have planted that are ready to be replanted or no seeds remaining.\n\nResuming previous trip"
		);
	});

	it('prepareFarmingStep replant respects last quantity and costs', async () => {
		const bank = new Bank().add('Acorn', 5).add('Supercompost', 5).add('Tomatoes(5)', 5).add('Coins', 10_000);
		const user = mockMUser({
			bank,
			skills_farming: convertLVLtoXP(40),
			skills_woodcutting: convertLVLtoXP(1)
		});
		const mutableUser = user.user as MutableUser;
		mutableUser.minion_defaultPay = false;
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
		if (!result.success) return;

		const { cost, quantity, duration, didPay, upgradeType, treeChopFee } = result.data;
		expect(quantity).toBe(treePatchDetailed.lastQuantity);
		expect(duration).toBe(treePatchDetailed.lastQuantity * (20 + 5 + 10) * 1000);
		expect(didPay).toBe(false);
		expect(upgradeType).toBe(CropUpgradeType.supercompost);
		expect(treeChopFee).toBe(200 * treePatchDetailed.lastQuantity);
		expect(cost.amount('Acorn')).toBe(treePatchDetailed.lastQuantity);
		expect(cost.amount('Supercompost')).toBe(treePatchDetailed.lastQuantity);
		expect(cost.amount('Tomatoes(5)')).toBe(0);
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
			previousCL: new Bank(),
			clLootBank: null
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
		expect(response).toContain('4x Compost + 4x Guam seed');

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
			skills_woodcutting: convertLVLtoXP(1)
		});
		const mutableUser = user.user as MutableUser;
		mutableUser.auto_farm_filter = AutoFarmFilterEnum.Replant;
		mutableUser.minion_defaultPay = false;
		mutableUser.minion_defaultCompostToUse = CropUpgradeType.supercompost;

		const transactResult = {
			newUser: user.user,
			itemsAdded: new Bank(),
			itemsRemoved: new Bank(),
			newBank: user.bank.clone(),
			newCL: user.cl.clone(),
			previousCL: new Bank(),
			clLootBank: null
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
		expect(response).toContain('3x Supercompost + 3x Acorn');

		expect(transactSpy).toHaveBeenCalledTimes(1);
		const [transactArg] = transactSpy.mock.calls[0];
		expect(transactArg.itemsToRemove).toBeDefined();
		const itemsToRemove = transactArg.itemsToRemove!;
		expect(itemsToRemove.amount('Acorn')).toBe(3);
		expect(itemsToRemove.amount('Supercompost')).toBe(3);
		expect(itemsToRemove.amount('Tomatoes(5)')).toBe(0);

		expect(statsSpy).toHaveBeenCalledWith('farming_plant_cost_bank', expect.any(Bank));
		expect(updateBankSettingSpy).toHaveBeenCalledWith('farming_cost_bank', expect.any(Bank));

		expect(addSubTaskToActivityTask).toHaveBeenCalledTimes(1);
		const taskArgs = (addSubTaskToActivityTask as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0];
		expect(taskArgs.autoFarmPlan).toHaveLength(1);
		expect(taskArgs.autoFarmPlan[0].quantity).toBe(treePatchDetailed.lastQuantity);
		expect(taskArgs.autoFarmPlan[0].duration).toBe(treePatchDetailed.lastQuantity * (20 + 5 + 10) * 1000);
		expect(taskArgs.autoFarmPlan[0].treeChopFeePlanned).toBe(200 * treePatchDetailed.lastQuantity);
		expect(taskArgs.autoFarmPlan[0].currentDate).toBe(new Date('2020-01-01T01:00:00Z').valueOf());
		expect(taskArgs.autoFarmPlan[0].upgradeType).toBe(CropUpgradeType.supercompost);
		expect(taskArgs.autoFarmPlan[0].payment).toBe(false);
	});

	it('autoFarm respects empty patch preferences', async () => {
		const bank = new Bank().add('Guam seed', 4).add('Compost', 4);
		const user = mockMUser({
			bank,
			skills_farming: convertLVLtoXP(50)
		});
		const mutableUser = user.user as MutableUser;
		mutableUser.auto_farm_filter = AutoFarmFilterEnum.AllFarm;
		(mutableUser as any).minion_farmingPreferredSeeds = { herb: { type: 'empty' } };

		calcMaxTripLengthSpy.mockReturnValue(300 * 1000);

		const response = await autoFarm(
			user,
			[herbPatchDetailed],
			herbPatches as Record<FarmingPatchName, IPatchData>,
			baseInteraction as MInteraction
		);

		if (!isBaseMessage(response)) {
			throw new Error('Expected BaseMessageOptions response');
		}
		expect(response.content).toBe("There's no Farming actions available for your saved preferences.");
	});

	it('autoFarm follows specific seed preferences', async () => {
		const bank = new Bank().add('Guam seed', 4).add('Ranarr seed', 4).add('Compost', 8);
		const user = mockMUser({
			bank,
			skills_farming: convertLVLtoXP(50)
		});
		const mutableUser = user.user as MutableUser;
		mutableUser.auto_farm_filter = AutoFarmFilterEnum.AllFarm;
		(mutableUser as any).minion_farmingPreferredSeeds = {
			herb: { type: 'seed', seedID: itemID('Guam seed') }
		};

		calcMaxTripLengthSpy.mockReturnValue(300 * 1000);

		const response = await autoFarm(
			user,
			[herbPatchDetailed],
			herbPatches as Record<FarmingPatchName, IPatchData>,
			baseInteraction as MInteraction
		);

		expect(typeof response).toBe('string');
		if (typeof response !== 'string') return;
		expect(response).toContain('Guam');
		expect(response).not.toContain('Ranarr');
	});

	it('autoFarm highest_available preference picks best seed', async () => {
		const bank = new Bank().add('Guam seed', 4).add('Ranarr seed', 4).add('Compost', 8);
		const user = mockMUser({
			bank,
			skills_farming: convertLVLtoXP(50)
		});
		const mutableUser = user.user as MutableUser;
		mutableUser.auto_farm_filter = AutoFarmFilterEnum.AllFarm;
		(mutableUser as any).minion_farmingPreferredSeeds = {
			herb: { type: 'highest_available' }
		};

		calcMaxTripLengthSpy.mockReturnValue(300 * 1000);

		const response = await autoFarm(
			user,
			[herbPatchDetailed],
			herbPatches as Record<FarmingPatchName, IPatchData>,
			baseInteraction as MInteraction
		);

		expect(typeof response).toBe('string');
		if (typeof response !== 'string') return;
		expect(response).toContain('Ranarr');
	});

	it('autoFarm prioritizes contract crops when preferred', async () => {
		const bank = new Bank().add('Guam seed', 4).add('Ranarr seed', 4).add('Compost', 8);
		const user = mockMUser({
			bank,
			skills_farming: convertLVLtoXP(50)
		});
		const mutableUser = user.user as MutableUser & {
			minion_farmingContract?: any;
			minion_farmingPreferContract?: boolean;
		};
		mutableUser.auto_farm_filter = AutoFarmFilterEnum.AllFarm;
		mutableUser.minion_farmingPreferContract = true;
		mutableUser.minion_farmingContract = {
			hasContract: true,
			difficultyLevel: 'easy',
			plantToGrow: herbPlant.name,
			plantTier: 1,
			contractsCompleted: 0
		};
		(mutableUser as any).minion_farmingPreferredSeeds = {
			herb: { type: 'seed', seedID: itemID('Ranarr seed') }
		};

		calcMaxTripLengthSpy.mockReturnValue(300 * 1000);

		const response = await autoFarm(
			user,
			[herbPatchDetailed],
			herbPatches as Record<FarmingPatchName, IPatchData>,
			baseInteraction as MInteraction
		);

		expect(typeof response).toBe('string');
		expect(addSubTaskToActivityTask).toHaveBeenCalledTimes(1);
		const taskArgs = (addSubTaskToActivityTask as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0];
		expect(taskArgs.autoFarmPlan[0].plantsName).toBe(herbPlant.name);
	});

	it('autoFarm honours per-patch preference when contract priority disabled', async () => {
		const bank = new Bank().add('Guam seed', 4).add('Ranarr seed', 4).add('Compost', 8);
		const user = mockMUser({
			bank,
			skills_farming: convertLVLtoXP(50)
		});
		const mutableUser = user.user as MutableUser & {
			minion_farmingContract?: any;
			minion_farmingPreferContract?: boolean;
		};
		mutableUser.auto_farm_filter = AutoFarmFilterEnum.AllFarm;
		mutableUser.minion_farmingPreferContract = false;
		mutableUser.minion_farmingContract = {
			hasContract: true,
			difficultyLevel: 'easy',
			plantToGrow: herbPlant.name,
			plantTier: 1,
			contractsCompleted: 0
		};
		(mutableUser as any).minion_farmingPreferredSeeds = {
			herb: { type: 'seed', seedID: itemID('Ranarr seed') }
		};

		calcMaxTripLengthSpy.mockReturnValue(300 * 1000);

		const response = await autoFarm(
			user,
			[herbPatchDetailed],
			herbPatches as Record<FarmingPatchName, IPatchData>,
			baseInteraction as MInteraction
		);

		expect(typeof response).toBe('string');
		expect(addSubTaskToActivityTask).toHaveBeenCalledTimes(1);
		const taskArgs = (addSubTaskToActivityTask as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0];
		expect(taskArgs.autoFarmPlan[0].plantsName).toBe(ranarrPlant.name);
	});
});

describe('resolveSeedForPatch', () => {
	it('prioritizes contract crops when preferred', () => {
		const preferences = new Map<FarmingPatchName, FarmingSeedPreference>([
			[herbPlant.seedType, { type: 'seed', seedID: herbSeedID }]
		]);

		const result = resolveSeedForPatch({
			patch: herbPatchReadyDetailed,
			preferContract: true,
			contractPlant: herbPlant,
			preferences,
			fallbackPlant: null
		});

		expect(result).not.toBeNull();
		expect(result).toMatchObject({ type: 'plant', plant: herbPlant, reason: 'contract' });
	});

	it('honours per-patch preferences when contract priority disabled', () => {
		const preferences = new Map<FarmingPatchName, FarmingSeedPreference>([
			[herbPlant.seedType, { type: 'seed', seedID: herbSeedID }]
		]);

		const result = resolveSeedForPatch({
			patch: herbPatchReadyDetailed,
			preferContract: false,
			contractPlant: herbPlant,
			preferences,
			fallbackPlant: null
		});

		expect(result).not.toBeNull();
		expect(result).toMatchObject({ type: 'plant', plant: herbPlant, reason: 'preference_seed' });
	});
});
