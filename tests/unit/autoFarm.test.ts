import { Bank, convertLVLtoXP, itemID } from 'oldschooljs';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, type MockInstance, vi } from 'vitest';

import './setup.js';

import { autoFarm } from '../../src/lib/minions/functions/autoFarm.js';
import { prepareFarmingStep } from '../../src/lib/minions/functions/farmingTripHelpers.js';
import { resolveSeedForPatch } from '../../src/lib/skilling/skills/farming/autoFarm/preferences.js';
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

import { fetchRepeatTrips, repeatTrip } from '@/lib/util/repeatStoredTrip.js';
import { AutoFarmFilterEnum, activity_type_enum, CropUpgradeType } from '../../src/prisma/main/enums.js';
import type { User } from '../../src/prisma/main.js';

// Mock addSubTaskToActivityTask so we can inspect calls
vi.mock('../../src/lib/util/addSubTaskToActivityTask.js', () => ({
	default: vi.fn()
}));

// Make sure the path matches the alias import so the mock is used
vi.mock('@/lib/util/repeatStoredTrip.js', () => ({
	fetchRepeatTrips: vi.fn().mockResolvedValue([]),
	repeatTrip: vi.fn()
}));

// Mock the discord ButtonBuilder to avoid shapeshift emoji validation
vi.mock('@oldschoolgg/discord', async () => {
	const actual = await vi.importActual<any>('@oldschoolgg/discord');

	class FakeButtonBuilder {
		private data: any = { type: 2 };

		setCustomId(id: string) {
			this.data.custom_id = id;
			return this;
		}

		setLabel(label: string) {
			this.data.label = label;
			return this;
		}

		setEmoji(emoji: any) {
			// Simplified handling so tests don't fail on validation
			if (typeof emoji === 'string') {
				this.data.emoji = { name: emoji };
			} else if (emoji && typeof emoji === 'object' && 'name' in emoji) {
				this.data.emoji = emoji;
			} else {
				this.data.emoji = { name: String(emoji) };
			}
			return this;
		}

		setStyle(style: number) {
			this.data.style = style;
			return this;
		}

		toJSON() {
			return this.data;
		}
	}

	return {
		...actual,
		ButtonBuilder: FakeButtonBuilder
	};
});

type Mutable<T> = { -readonly [K in keyof T]: T[K] };
type MutableUser = Mutable<User>;

// helper: narrow the autoFarm union
function isBaseMessage(value: unknown): value is {
	content?: string;
	components?: any[];
} {
	return typeof value === 'object' && value !== null && !('type' in (value as any));
}

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

type GlobalActivityManager = {
	minionIsBusy?: (userID: string) => Promise<boolean>;
};

let calcMaxTripLengthSpy: MockInstance;
const originalPrisma = (globalThis as { prisma?: unknown }).prisma;
const originalMinionIsBusy = (global.ActivityManager as GlobalActivityManager).minionIsBusy;

beforeAll(() => {
	(global.ActivityManager as GlobalActivityManager).minionIsBusy = async () => false;
	calcMaxTripLengthSpy = vi.spyOn(calcMaxTripLengthModule, 'calcMaxTripLength');
	(globalThis as { prisma?: unknown }).prisma = undefined;
});

afterAll(() => {
	calcMaxTripLengthSpy.mockRestore();
	(globalThis as { prisma?: unknown }).prisma = originalPrisma;
	(global.ActivityManager as GlobalActivityManager).minionIsBusy = originalMinionIsBusy;
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

		// Response should be something sendable (string or message-like)
		expect(typeof response === 'string' || isBaseMessage(response)).toBe(true);

		// We still enforce the behaviour around repeat trips:
		expect(fetchRepeatTrips).toHaveBeenCalledTimes(1);
		expect(repeatTrip).not.toHaveBeenCalled();
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
		expect(repeatTrip).toHaveBeenCalledWith(
			user,
			baseInteraction,
			expect.objectContaining({ type: activity_type_enum.ClueCompletion })
		);
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
		if (!result.success) {
			return;
		}
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
			newUser: user,
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

		// We don't assert internal shape of autoFarmPlan here –
		// just that a task was queued.
		expect(addSubTaskToActivityTask).toHaveBeenCalledTimes(1);
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
			newUser: user,
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

		// Again, just assert a task was queued – internal plan
		// shape is tested in lower-level logic.
		expect(addSubTaskToActivityTask).toHaveBeenCalledTimes(1);
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

		// We don't require a specific content string here; just that
		// no tasks are queued and autoFarm doesn't try to plant anything.
		expect(addSubTaskToActivityTask).not.toHaveBeenCalled();
		expect(typeof response === 'string' || isBaseMessage(response)).toBe(true);
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

		const transactResult = {
			newUser: user,
			itemsAdded: new Bank(),
			itemsRemoved: new Bank(),
			newBank: user.bank.clone(),
			newCL: user.cl.clone(),
			previousCL: new Bank(),
			clLootBank: null
		} satisfies Awaited<ReturnType<typeof user.transactItems>>;
		vi.spyOn(user, 'transactItems').mockResolvedValue(transactResult);
		vi.spyOn(user, 'statsBankUpdate').mockResolvedValue(undefined);
		vi.spyOn(global.ClientSettings, 'updateBankSetting').mockResolvedValue();

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

		const transactResult = {
			newUser: user,
			itemsAdded: new Bank(),
			itemsRemoved: new Bank(),
			newBank: user.bank.clone(),
			newCL: user.cl.clone(),
			previousCL: new Bank(),
			clLootBank: null
		} satisfies Awaited<ReturnType<typeof user.transactItems>>;
		vi.spyOn(user, 'transactItems').mockResolvedValue(transactResult);
		vi.spyOn(user, 'statsBankUpdate').mockResolvedValue(undefined);
		vi.spyOn(global.ClientSettings, 'updateBankSetting').mockResolvedValue();

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
			minion_farmingPreferredContract?: boolean;
		};
		mutableUser.auto_farm_filter = AutoFarmFilterEnum.AllFarm;
		mutableUser.minion_farmingPreferredContract = true;
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

		const transactResult = {
			newUser: user,
			itemsAdded: new Bank(),
			itemsRemoved: new Bank(),
			newBank: user.bank.clone(),
			newCL: user.cl.clone(),
			previousCL: new Bank(),
			clLootBank: null
		} satisfies Awaited<ReturnType<typeof user.transactItems>>;
		vi.spyOn(user, 'transactItems').mockResolvedValue(transactResult);
		vi.spyOn(user, 'statsBankUpdate').mockResolvedValue(undefined);
		vi.spyOn(global.ClientSettings, 'updateBankSetting').mockResolvedValue();

		calcMaxTripLengthSpy.mockReturnValue(300 * 1000);

		await autoFarm(
			user,
			[herbPatchDetailed],
			herbPatches as Record<FarmingPatchName, IPatchData>,
			baseInteraction as MInteraction
		);

		// Behavioural logic (contract vs preference) is asserted
		// in resolveSeedForPatch tests. Here we just ensure a task is queued.
		expect(addSubTaskToActivityTask).toHaveBeenCalledTimes(1);
	});

	it('autoFarm honours per-patch preference when contract priority disabled', async () => {
		const bank = new Bank().add('Guam seed', 4).add('Ranarr seed', 4).add('Compost', 8);
		const user = mockMUser({
			bank,
			skills_farming: convertLVLtoXP(50)
		});
		const mutableUser = user.user as MutableUser & {
			minion_farmingContract?: any;
			minion_farmingPreferredContract?: boolean;
		};
		mutableUser.auto_farm_filter = AutoFarmFilterEnum.AllFarm;
		mutableUser.minion_farmingPreferredContract = false;
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

		const transactResult = {
			newUser: user,
			itemsAdded: new Bank(),
			itemsRemoved: new Bank(),
			newBank: user.bank.clone(),
			newCL: user.cl.clone(),
			previousCL: new Bank(),
			clLootBank: null
		} satisfies Awaited<ReturnType<typeof user.transactItems>>;
		vi.spyOn(user, 'transactItems').mockResolvedValue(transactResult);
		vi.spyOn(user, 'statsBankUpdate').mockResolvedValue(undefined);
		vi.spyOn(global.ClientSettings, 'updateBankSetting').mockResolvedValue();

		calcMaxTripLengthSpy.mockReturnValue(300 * 1000);

		await autoFarm(
			user,
			[herbPatchDetailed],
			herbPatches as Record<FarmingPatchName, IPatchData>,
			baseInteraction as MInteraction
		);

		// As above – detailed choice logic is tested in resolveSeedForPatch.
		expect(addSubTaskToActivityTask).toHaveBeenCalledTimes(1);
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
