import { AutoFarmFilterEnum } from '@prisma/client';
import { Bank } from 'oldschooljs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { MUser } from '../../src/lib/MUser.js';
import type { IPatchData, IPatchDataDetailed } from '../../src/lib/minions/farming/types.js';
import { autoFarm } from '../../src/lib/minions/functions/autoFarm.js';
import Farming from '../../src/lib/skilling/skills/farming/index.js';
import { SkillsEnum } from '../../src/lib/skilling/types.js';
import type { FarmingPatchName } from '../../src/lib/util/farmingHelpers.js';

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
			[SkillsEnum.Farming]: farmingLevel,
			[SkillsEnum.Woodcutting]: woodcuttingLevel
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
		skillLevel: vi.fn((skill: SkillsEnum) => {
			if (skill === SkillsEnum.Farming) return farmingLevel;
			if (skill === SkillsEnum.Woodcutting) return woodcuttingLevel;
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
	const redwoodPlant = Farming.Plants.find(plant => plant.name === 'Redwood tree');
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

		expect(response).toContain('auto farming');
		expect(user.user.GP).toBe(5000);
		expect(addSubTaskMock).toHaveBeenCalled();
		const firstCallArgs = addSubTaskMock.mock.calls[0]?.[0];
		expect(firstCallArgs?.treeChopFeePaid).toBe(0);
		expect(firstCallArgs?.treeChopFeePlanned).toBe(2000);
	});

        it('reserves the tree clearing fee when switching to a different tree type', async () => {
                const magicPlant = Farming.Plants.find(plant => plant.name === 'Magic tree');
                const yewPlant = Farming.Plants.find(plant => plant.name === 'Yew tree');
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

		expect(response).toContain('auto farming');
		expect(user.user.GP).toBe(1000);
		expect(addSubTaskMock).toHaveBeenCalled();
		const firstCallArgs = addSubTaskMock.mock.calls[0]?.[0];
		expect(firstCallArgs?.plantsName).toBe(yewPlant.name);
		expect(firstCallArgs?.treeChopFeePaid).toBe(0);
                expect(firstCallArgs?.treeChopFeePlanned).toBe(200);
        });

        it('plans sequential trips even when combined duration exceeds the max trip length', async () => {
                mockedCalcMaxTripLength.mockReturnValue(45 * 1000);

                const magicPlant = Farming.Plants.find(plant => plant.name === 'Magic tree');
                if (!magicPlant) {
                        throw new Error('Expected magic plant data');
                }

                const user = createAutoFarmStub({
                        gp: 10_000,
                        farmingLevel: 99,
                        woodcuttingLevel: 99,
                        bank: new Bank({ 'Redwood tree seed': 1, 'Magic seed': 1 }),
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

                const response = await autoFarm(
                        user,
                        patchesDetailed,
                        patches as Record<FarmingPatchName, IPatchData>,
                        '123'
                );

                expect(response).toContain('Redwood patch');
                expect(response).toContain('Tree patch');
                expect(addSubTaskMock).toHaveBeenCalled();
                const firstCallArgs = addSubTaskMock.mock.calls[0]?.[0];
                expect(firstCallArgs?.autoFarmPlan).toHaveLength(1);
                expect(firstCallArgs?.autoFarmPlan?.[0]?.plantsName).toBe(magicPlant.name);
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
