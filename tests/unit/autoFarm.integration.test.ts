import { AutoFarmFilterEnum } from '@prisma/client';
import { Bank } from 'oldschooljs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { MUser } from '../../src/lib/MUser.js';
import { autoFarm } from '../../src/lib/minions/functions/autoFarm.js';
import { Farming } from '../../src/lib/skilling/skills/farming/index.js';
import type { FarmingPatchName } from '../../src/lib/skilling/skills/farming/utils/farmingHelpers.js';
import type { IPatchData, IPatchDataDetailed } from '../../src/lib/skilling/skills/farming/utils/types.js';
import type { Plant } from '../../src/lib/skilling/types.js';
import type { AutoFarmStepData } from '../../src/lib/types/minions.js';

const { addSubTaskMock, mockedCalcMaxTripLength } = vi.hoisted(() => {
	const calcMaxTripLengthMock = vi.fn(() => 60 * 60 * 1000);
	return {
		addSubTaskMock: vi.fn(),
		mockedCalcMaxTripLength: calcMaxTripLengthMock
	};
});

vi.mock('../../src/lib/util/updateBankSetting.js', () => ({
	updateBankSetting: vi.fn()
}));
vi.mock('@/mahoji/mahojiSettings.js', () => ({
	userStatsBankUpdate: vi.fn(),
	userHasGracefulEquipped: vi.fn().mockReturnValue(false)
}));
vi.mock('../../src/lib/util/addSubTaskToActivityTask.js', () => ({
	default: addSubTaskMock
}));
vi.mock('../../src/lib/util/calcMaxTripLength.js', () => ({
	calcMaxTripLength: mockedCalcMaxTripLength
}));

interface AutoFarmStubOptions {
	gp: number;
	farmingLevel: number;
	woodcuttingLevel: number;
	bank: Bank;
	autoFarmFilter?: AutoFarmFilterEnum;
}

function createAutoFarmStub({
	gp,
	farmingLevel,
	woodcuttingLevel,
	bank,
	autoFarmFilter = AutoFarmFilterEnum.Replant
}: AutoFarmStubOptions) {
	const bankState = bank.clone();
	const emptyGearSetup = {
		hasEquipped: vi.fn().mockReturnValue(false),
		equippedWeapon: vi.fn().mockReturnValue({ name: '' })
	} as const;
	const user = {
		id: '1',
		user: {
			id: '1',
			GP: gp,
			bank: bankState.toJSON(),
			auto_farm_filter: autoFarmFilter,
			minion_defaultPay: false,
			minion_defaultCompostToUse: null,
			completed_ca_task_ids: []
		},
		bank: bankState,
		cl: new Bank(),
		GP: gp,
		minionName: 'Stub Minion',
		minionIsBusy: false,
		get autoFarmFilter() {
			return this.user.auto_farm_filter;
		},
		QP: 200,
		bitfield: [] as number[],
		toString() {
			return 'StubUser';
		},
		gear: {
			melee: emptyGearSetup,
			range: emptyGearSetup,
			mage: emptyGearSetup,
			misc: emptyGearSetup,
			skilling: emptyGearSetup
		},
		skillsAsXP: {
			farming: farmingLevel,
			woodcutting: woodcuttingLevel
		},
		skillsAsLevels: {
			agility: 1,
			cooking: 1,
			fishing: 1,
			mining: 1,
			smithing: 1,
			woodcutting: woodcuttingLevel,
			firemaking: 1,
			runecraft: 1,
			crafting: 1,
			prayer: 1,
			fletching: 1,
			farming: farmingLevel,
			herblore: 1,
			thieving: 1,
			hunter: 1,
			construction: 1,
			magic: 1,
			attack: 1,
			strength: 1,
			defence: 1,
			ranged: 1,
			hitpoints: 10,
			slayer: 1,
			combat: 3
		},
		skillsAsRequirements: {
			agility: 1,
			cooking: 1,
			fishing: 1,
			mining: 1,
			smithing: 1,
			woodcutting: woodcuttingLevel,
			firemaking: 1,
			runecraft: 1,
			crafting: 1,
			prayer: 1,
			fletching: 1,
			farming: farmingLevel,
			herblore: 1,
			thieving: 1,
			hunter: 1,
			construction: 1,
			magic: 1,
			attack: 1,
			strength: 1,
			defence: 1,
			ranged: 1,
			hitpoints: 10,
			slayer: 1
		},
		skillLevel: vi.fn((skill: string) => {
			if (skill === 'farming') return farmingLevel;
			if (skill === 'woodcutting') return woodcuttingLevel;
			return 1;
		}),
		owns: vi.fn((cost: Bank) => {
			const owned = bankState.clone();
			owned.add('Coins', user.user.GP);
			return owned.has(cost);
		}),
		transactItems: vi.fn(async ({ itemsToRemove }: { itemsToRemove?: Bank }) => {
			if (itemsToRemove) {
				const removal = new Bank(itemsToRemove);
				const coins = removal.amount('Coins');
				if (coins > 0) {
					user.user.GP -= coins;
					user.GP -= coins;
					removal.remove('Coins', coins);
				}
				bankState.remove(removal);
				user.user.bank = bankState.toJSON();
			}
			return { newUser: user.user };
		}),
		addXP: vi.fn().mockResolvedValue('XP'),
		addItemsToCollectionLog: vi.fn().mockResolvedValue(undefined),
		hasEquippedOrInBank: vi.fn().mockReturnValue(false),
		hasEquipped: vi.fn().mockReturnValue(false),
		hasGracefulEquipped: vi.fn().mockReturnValue(false),
		farmingContract: vi.fn().mockReturnValue({
			contract: {
				plantsContract: null,
				seedType: null,
				quantity: 0,
				contractsCompleted: 0
			}
		}),
		fetchMinigames: vi.fn().mockResolvedValue({}),
		fetchStats: vi.fn().mockResolvedValue({}),
		perkTier: vi.fn().mockReturnValue(0),
		hasSkillReqs: vi.fn().mockReturnValue([true, null]),
		getAttackStyles: vi.fn().mockReturnValue([]),
		update: vi.fn().mockResolvedValue(undefined)
	} as any;
	return user as MUser;
}

describe('autoFarm tree clearing fees', () => {
	const redwoodPlant = Farming.Plants.find((plant: Plant) => plant.name === 'Redwood tree');
	if (!redwoodPlant) {
		throw new Error('Expected redwood plant data');
	}

	const basePatch: IPatchData & { patchName: FarmingPatchName } = {
		lastPlanted: redwoodPlant.name,
		patchPlanted: true,
		plantTime: Date.now(),
		lastQuantity: 1,
		lastUpgradeType: null,
		lastPayment: false,
		patchName: redwoodPlant.seedType as FarmingPatchName
	};

	beforeEach(() => {
		addSubTaskMock.mockReset();
		mockedCalcMaxTripLength.mockClear();
		mockedCalcMaxTripLength.mockReturnValue(60 * 60 * 1000);
		globalThis.prisma = {
			farmedCrop: {
				create: vi.fn().mockResolvedValue({ id: 123 })
			}
		} as any;
	});

	afterEach(() => {
		// @ts-expect-error intentional cleanup
		globalThis.prisma = undefined;
	});

	it('reserves the tree clearing fee during auto farm planning', async () => {
		const user = createAutoFarmStub({
			gp: 5000,
			farmingLevel: 99,
			woodcuttingLevel: 1,
			bank: new Bank({ 'Redwood tree seed': 1 })
		});

		const patchesDetailed: IPatchDataDetailed[] = [
			{
				...basePatch,
				ready: true,
				readyIn: null,
				readyAt: null,
				friendlyName: 'Redwood patch',
				plant: redwoodPlant
			}
		];

		const patches: Partial<Record<FarmingPatchName, IPatchData>> = {
			[basePatch.patchName]: {
				lastPlanted: basePatch.lastPlanted,
				patchPlanted: basePatch.patchPlanted,
				plantTime: basePatch.plantTime,
				lastQuantity: basePatch.lastQuantity,
				lastUpgradeType: basePatch.lastUpgradeType,
				lastPayment: basePatch.lastPayment
			}
		};

		const response = await autoFarm(user, patchesDetailed, patches as Record<FarmingPatchName, IPatchData>, '123');

		expect(response).toContain('auto farm the following patches:');
		expect(response).toContain('1. Redwood patch: 1x Redwood tree (Up to 2,000 GP to remove previous trees)');
		expect(response).not.toContain('You may need to pay a nearby farmer');
		expect(user.user.GP).toBe(5000);
		expect(addSubTaskMock).toHaveBeenCalled();
		const firstCallArgs = addSubTaskMock.mock.calls[0]?.[0];
		expect(firstCallArgs?.treeChopFeePaid).toBe(0);
		expect(firstCallArgs?.treeChopFeePlanned).toBe(2000);
	});

	it('skips planning when combined planting and clearing coins are insufficient', async () => {
		const redwoodIndex = Farming.Plants.findIndex((plant: Plant) => plant.name === 'Redwood tree');
		if (redwoodIndex === -1) {
			throw new Error('Expected redwood plant data');
		}

		const originalPlant = Farming.Plants[redwoodIndex]!;
		const modifiedPlant: Plant = {
			...originalPlant,
			inputItems: new Bank({ 'Redwood tree seed': 1, Coins: 3000 }).freeze()
		};
		Farming.Plants[redwoodIndex] = modifiedPlant;

		const user = createAutoFarmStub({
			gp: 0,
			farmingLevel: 99,
			woodcuttingLevel: 1,
			bank: new Bank({ 'Redwood tree seed': 1, Coins: 4500 })
		});

		const patchesDetailed: IPatchDataDetailed[] = [
			{
				...basePatch,
				ready: true,
				readyIn: null,
				readyAt: null,
				friendlyName: 'Redwood patch',
				plant: modifiedPlant
			}
		];

		const patches: Partial<Record<FarmingPatchName, IPatchData>> = {
			[basePatch.patchName]: {
				lastPlanted: basePatch.lastPlanted,
				patchPlanted: basePatch.patchPlanted,
				plantTime: basePatch.plantTime,
				lastQuantity: basePatch.lastQuantity,
				lastUpgradeType: basePatch.lastUpgradeType,
				lastPayment: basePatch.lastPayment
			}
		};

		try {
			const response = await autoFarm(
				user,
				patchesDetailed,
				patches as Record<FarmingPatchName, IPatchData>,
				'123'
			);

			expect(response).toBe(`You don't own ${new Bank().add('Coins', 5000)}.`);
			expect(addSubTaskMock).not.toHaveBeenCalled();
		} finally {
			Farming.Plants[redwoodIndex] = originalPlant;
		}
	});

	it('reserves the tree clearing fee when switching to a different tree type', async () => {
		const magicPlant = Farming.Plants.find((plant: Plant) => plant.name === 'Magic tree');
		const yewPlant = Farming.Plants.find((plant: Plant) => plant.name === 'Yew tree');
		if (!magicPlant || !yewPlant) {
			throw new Error('Expected magic and yew plant data');
		}

		const user = createAutoFarmStub({
			gp: 1000,
			farmingLevel: 99,
			woodcuttingLevel: 1,
			bank: new Bank({ 'Yew seed': 10 }),
			autoFarmFilter: AutoFarmFilterEnum.AllFarm
		});

		const patchName = magicPlant.seedType as FarmingPatchName;
		const patchesDetailed: IPatchDataDetailed[] = [
			{
				lastPlanted: magicPlant.name,
				patchPlanted: true,
				plantTime: Date.now(),
				lastQuantity: 1,
				lastUpgradeType: null,
				lastPayment: false,
				patchName,
				ready: true,
				readyIn: null,
				readyAt: null,
				friendlyName: 'Tree patch',
				plant: magicPlant
			}
		];

		const patches: Partial<Record<FarmingPatchName, IPatchData>> = {
			[patchName]: {
				lastPlanted: magicPlant.name,
				patchPlanted: true,
				plantTime: patchesDetailed[0]!.plantTime,
				lastQuantity: patchesDetailed[0]!.lastQuantity,
				lastUpgradeType: patchesDetailed[0]!.lastUpgradeType,
				lastPayment: patchesDetailed[0]!.lastPayment
			}
		};

		const response = await autoFarm(user, patchesDetailed, patches as Record<FarmingPatchName, IPatchData>, '123');

		expect(response).toContain('auto farm the following patches:');
		expect(response).toContain('1. Tree patch: 1x Yew tree (Up to 200 GP to remove previous trees)');
		expect(user.user.GP).toBe(1000);
		expect(addSubTaskMock).toHaveBeenCalled();
		const firstCallArgs = addSubTaskMock.mock.calls[0]?.[0];
		expect(firstCallArgs?.plantsName).toBe(yewPlant.name);
		expect(firstCallArgs?.treeChopFeePaid).toBe(0);
		expect(firstCallArgs?.treeChopFeePlanned).toBe(200);
	});

	it('skips crops that would exceed the combined duration but continues planning smaller ones', async () => {
		mockedCalcMaxTripLength.mockReturnValue(40 * 1000);

		const celastrusPlant = Farming.Plants.find((plant: Plant) => plant.name === 'Celastrus tree');
		const magicPlant = Farming.Plants.find((plant: Plant) => plant.name === 'Magic tree');
		const mushroomPlant = Farming.Plants.find((plant: Plant) => plant.name === 'Mushroom');
		if (!celastrusPlant || !magicPlant || !mushroomPlant) {
			throw new Error('Expected celastrus, magic, and mushroom plant data');
		}

		const user = createAutoFarmStub({
			gp: 10_000,
			farmingLevel: 99,
			woodcuttingLevel: 99,
			bank: new Bank({ 'Celastrus seed': 10, 'Magic seed': 10, 'Mushroom spore': 10 }),
			autoFarmFilter: AutoFarmFilterEnum.AllFarm
		});

		const celastrusPatchDetailed: IPatchDataDetailed = {
			lastPlanted: celastrusPlant.name,
			patchPlanted: true,
			plantTime: Date.now(),
			lastQuantity: 1,
			lastUpgradeType: null,
			lastPayment: false,
			patchName: 'celastrus' as FarmingPatchName,
			ready: true,
			readyIn: null,
			readyAt: null,
			friendlyName: 'Celastrus patch',
			plant: celastrusPlant
		};

		const treePatchDetailed: IPatchDataDetailed = {
			lastPlanted: magicPlant.name,
			patchPlanted: true,
			plantTime: Date.now(),
			lastQuantity: 1,
			lastUpgradeType: null,
			lastPayment: false,
			patchName: 'tree' as FarmingPatchName,
			ready: true,
			readyIn: null,
			readyAt: null,
			friendlyName: 'Tree patch',
			plant: magicPlant
		};

		const mushroomPatchDetailed: IPatchDataDetailed = {
			lastPlanted: null,
			patchPlanted: false,
			plantTime: Date.now(),
			lastQuantity: 0,
			lastUpgradeType: null,
			lastPayment: false,
			patchName: 'mushroom' as FarmingPatchName,
			ready: true,
			readyIn: null,
			readyAt: null,
			friendlyName: 'Mushroom patch',
			plant: mushroomPlant
		};

		const patchesDetailed: IPatchDataDetailed[] = [
			celastrusPatchDetailed,
			treePatchDetailed,
			mushroomPatchDetailed
		];

		const patches: Partial<Record<FarmingPatchName, IPatchData>> = {
			[celastrusPatchDetailed.patchName]: {
				lastPlanted: celastrusPatchDetailed.lastPlanted,
				patchPlanted: celastrusPatchDetailed.patchPlanted,
				plantTime: celastrusPatchDetailed.plantTime,
				lastQuantity: celastrusPatchDetailed.lastQuantity,
				lastUpgradeType: celastrusPatchDetailed.lastUpgradeType,
				lastPayment: celastrusPatchDetailed.lastPayment
			},
			[treePatchDetailed.patchName]: {
				lastPlanted: treePatchDetailed.lastPlanted,
				patchPlanted: treePatchDetailed.patchPlanted,
				plantTime: treePatchDetailed.plantTime,
				lastQuantity: treePatchDetailed.lastQuantity,
				lastUpgradeType: treePatchDetailed.lastUpgradeType,
				lastPayment: treePatchDetailed.lastPayment
			},
			[mushroomPatchDetailed.patchName]: {
				lastPlanted: mushroomPatchDetailed.lastPlanted,
				patchPlanted: mushroomPatchDetailed.patchPlanted,
				plantTime: mushroomPatchDetailed.plantTime,
				lastQuantity: mushroomPatchDetailed.lastQuantity,
				lastUpgradeType: mushroomPatchDetailed.lastUpgradeType,
				lastPayment: mushroomPatchDetailed.lastPayment
			}
		};

		const response = await autoFarm(user, patchesDetailed, patches as Record<FarmingPatchName, IPatchData>, '123');

		expect(response).toContain('Celastrus patch');
		expect(response).toContain('1. Celastrus patch: 1x Celastrus tree');
		expect(response).not.toContain('Tree patch');
		expect(response).toContain('Mushroom patch');
		expect(response).toContain('2. Mushroom patch: 1x Mushroom');
		expect(response).toContain('were skipped because the total trip length would exceed the maximum');
		expect(addSubTaskMock).toHaveBeenCalled();
		const firstCallArgs = addSubTaskMock.mock.calls[0]?.[0];
		expect(firstCallArgs?.plantsName).toBe(celastrusPlant.name);
		expect(firstCallArgs?.autoFarmCombined).toBe(true);
		const plan = firstCallArgs?.autoFarmPlan as AutoFarmStepData[] | undefined;
		expect(plan).toBeDefined();
		if (!plan) {
			throw new Error('Expected autoFarmPlan to be defined');
		}
		expect(plan).toHaveLength(2);
		expect(plan.map((step: AutoFarmStepData) => step.plantsName)).toStrictEqual([
			celastrusPlant.name,
			mushroomPlant.name
		]);
		const expectedDuration = plan.reduce((acc: number, step: AutoFarmStepData) => acc + step.duration, 0);
		expect(firstCallArgs?.duration).toBe(expectedDuration);
	});

	it('continues planning additional steps while staying within the max trip length', async () => {
		mockedCalcMaxTripLength.mockReturnValue(20 * 60 * 1000);

		const magicPlant = Farming.Plants.find((plant: Plant) => plant.name === 'Magic tree');
		if (!magicPlant) {
			throw new Error('Expected magic plant data');
		}

		const user = createAutoFarmStub({
			gp: 10_000,
			farmingLevel: 99,
			woodcuttingLevel: 99,
			bank: new Bank({ 'Redwood tree seed': 4, 'Magic seed': 10 }),
			autoFarmFilter: AutoFarmFilterEnum.AllFarm
		});

		const redwoodPatchDetailed: IPatchDataDetailed = {
			...basePatch,
			ready: true,
			readyIn: null,
			readyAt: null,
			friendlyName: 'Redwood patch',
			plant: redwoodPlant
		};

		const treePatchDetailed: IPatchDataDetailed = {
			lastPlanted: magicPlant.name,
			patchPlanted: true,
			plantTime: Date.now(),
			lastQuantity: 1,
			lastUpgradeType: null,
			lastPayment: false,
			patchName: 'tree' as FarmingPatchName,
			ready: true,
			readyIn: null,
			readyAt: null,
			friendlyName: 'Tree patch',
			plant: magicPlant
		};

		const patchesDetailed: IPatchDataDetailed[] = [redwoodPatchDetailed, treePatchDetailed];

		const patches: Partial<Record<FarmingPatchName, IPatchData>> = {
			[redwoodPatchDetailed.patchName]: {
				lastPlanted: redwoodPatchDetailed.lastPlanted,
				patchPlanted: redwoodPatchDetailed.patchPlanted,
				plantTime: redwoodPatchDetailed.plantTime,
				lastQuantity: redwoodPatchDetailed.lastQuantity,
				lastUpgradeType: redwoodPatchDetailed.lastUpgradeType,
				lastPayment: redwoodPatchDetailed.lastPayment
			},
			[treePatchDetailed.patchName]: {
				lastPlanted: treePatchDetailed.lastPlanted,
				patchPlanted: treePatchDetailed.patchPlanted,
				plantTime: treePatchDetailed.plantTime,
				lastQuantity: treePatchDetailed.lastQuantity,
				lastUpgradeType: treePatchDetailed.lastUpgradeType,
				lastPayment: treePatchDetailed.lastPayment
			}
		};

		const response = await autoFarm(user, patchesDetailed, patches as Record<FarmingPatchName, IPatchData>, '123');

		expect(response).toContain('Redwood patch');
		expect(response).toContain('1. Redwood patch: 1x Redwood tree');
		expect(response).not.toContain('Up to 2,000 GP to remove previous trees');
		expect(response).toContain('Tree patch');
		expect(response).toContain('2. Tree patch: 1x Magic tree');
		expect(response).not.toContain('were skipped because the total trip length would exceed the maximum');
		expect(addSubTaskMock).toHaveBeenCalled();
		const firstCallArgs = addSubTaskMock.mock.calls[0]?.[0];
		expect(firstCallArgs?.autoFarmCombined).toBe(true);
		const plan = firstCallArgs?.autoFarmPlan as AutoFarmStepData[] | undefined;
		expect(plan).toBeDefined();
		if (!plan) {
			throw new Error('Expected autoFarmPlan to be defined');
		}
		expect(plan).toHaveLength(2);
		expect(plan.map((step: AutoFarmStepData) => step.plantsName)).toStrictEqual([
			redwoodPlant.name,
			magicPlant.name
		]);
		const redwoodStep = plan.find((step: AutoFarmStepData) => step.plantsName === redwoodPlant.name);
		expect(redwoodStep?.treeChopFeePlanned).toBe(0);
		expect(redwoodStep?.treeChopFeePaid).toBe(0);
		const expectedDuration = plan.reduce((acc: number, step: AutoFarmStepData) => acc + step.duration, 0);
		expect(firstCallArgs?.duration).toBe(expectedDuration);
	});

	it('returns the first prepare error when no steps can be planned', async () => {
		const user = createAutoFarmStub({
			gp: 1000,
			farmingLevel: 99,
			woodcuttingLevel: 1,
			bank: new Bank({ 'Redwood tree seed': 1 })
		});

		const patchesDetailed: IPatchDataDetailed[] = [
			{
				...basePatch,
				ready: true,
				readyIn: null,
				readyAt: null,
				friendlyName: 'Redwood patch',
				plant: redwoodPlant
			}
		];

		const patches: Partial<Record<FarmingPatchName, IPatchData>> = {
			[basePatch.patchName]: {
				lastPlanted: basePatch.lastPlanted,
				patchPlanted: basePatch.patchPlanted,
				plantTime: basePatch.plantTime,
				lastQuantity: basePatch.lastQuantity,
				lastUpgradeType: basePatch.lastUpgradeType,
				lastPayment: basePatch.lastPayment
			}
		};

		const response = await autoFarm(user, patchesDetailed, patches as Record<FarmingPatchName, IPatchData>, '123');

		expect(response).toBe(
			'Your minion does not have 90 Woodcutting or the 2000 GP required to be able to harvest the currently planted trees, and so they cannot harvest them.'
		);
	});
});
