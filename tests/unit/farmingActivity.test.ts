import { Time } from '@oldschoolgg/toolkit/datetime';
import type { CropUpgradeType } from '@prisma/client';
import { Bank } from 'oldschooljs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { MUser } from '../../src/lib/MUser.js';
import type { IPatchDataDetailed } from '../../src/lib/minions/farming/types.js';
import { prepareFarmingStep } from '../../src/lib/minions/functions/farmingTripHelpers.js';
import Farming from '../../src/lib/skilling/skills/farming/index.js';
import { SkillsEnum } from '../../src/lib/skilling/types.js';
import type { FarmingActivityTaskOptions } from '../../src/lib/types/minions.js';
import { farmingTask } from '../../src/tasks/minions/farmingActivity.js';

vi.mock('@/lib/util/handleTripFinish.js', () => ({
        handleTripFinish: vi.fn()
}));
vi.mock('@/lib/util/updateBankSetting.js', () => ({
        updateBankSetting: vi.fn()
}));
vi.mock('@/lib/util/addSubTaskToActivityTask.js', () => ({
        default: vi.fn()
}));
vi.mock('@/lib/util/webhook.js', () => ({
        sendToChannelID: vi.fn()
}));
vi.mock('@/lib/combat_achievements/combatAchievements.js', () => ({
        combatAchievementTripEffect: vi.fn().mockResolvedValue(null)
}));
vi.mock('@/lib/canvas/chatHeadImage.js', () => ({
        default: vi.fn()
}));
vi.mock('@/mahoji/mahojiSettings.js', () => ({
	userStatsBankUpdate: vi.fn(),
	userHasGracefulEquipped: vi.fn().mockReturnValue(false)
}));

interface StubUserOptions {
	gp: number;
	farmingLevel: number;
	woodcuttingLevel: number;
}

function createStubUser({ gp, farmingLevel, woodcuttingLevel }: StubUserOptions) {
	const emptyGearSetup = {
		hasEquipped: vi.fn().mockReturnValue(false),
		equippedWeapon: vi.fn().mockReturnValue({ name: '' })
	} as const;
	const user = {
		id: '1',
		user: {
			id: '1',
			GP: gp,
			bank: {},
			minion_defaultPay: false,
			minion_defaultCompostToUse: null,
			completed_ca_task_ids: []
		},
		bitfield: [] as number[],
		bank: new Bank(),
		cl: new Bank(),
		GP: gp,
		minionName: 'Stub Minion',
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
			if (skill === SkillsEnum.Herblore) return 0;
			if (skill === SkillsEnum.Magic) return 1;
			if (skill === SkillsEnum.Ranged) return 1;
			if (skill === SkillsEnum.Attack) return 1;
			if (skill === SkillsEnum.Strength) return 1;
			if (skill === SkillsEnum.Defence) return 1;
			if (skill === SkillsEnum.Hitpoints) return 10;
			if (skill === SkillsEnum.Prayer) return 1;
			return 1;
		}),
		hasEquippedOrInBank: vi.fn().mockReturnValue(false),
		hasEquipped: vi.fn().mockReturnValue(false),
		addXP: vi.fn().mockResolvedValue('XP'),
		addItemsToCollectionLog: vi.fn().mockResolvedValue(undefined),
		removeItemsFromBank: vi.fn(async (bankToRemove: Bank) => {
			const coins = bankToRemove.amount('Coins');
			user.user.GP -= coins;
			user.GP -= coins;
			return { newUser: user.user };
		}),
		transactItems: vi.fn().mockResolvedValue({ newUser: null }),
		farmingContract: vi.fn().mockReturnValue({
			contract: {
				plantsContract: null,
				seedType: null,
				quantity: 0,
				contractsCompleted: 0
			}
		}),
		fetchMinigames: vi.fn().mockResolvedValue({}),
		fetchStats: vi.fn().mockResolvedValue({ farming_harvest_loot_bank: {} }),
		perkTier: vi.fn().mockReturnValue(0),
		hasSkillReqs: vi.fn().mockReturnValue([true, null]),
		getAttackStyles: vi.fn().mockReturnValue([]),
		update: vi.fn().mockResolvedValue(undefined),
		owns: vi.fn().mockReturnValue(true),
		addXPBonus: vi.fn(),
		QP: 200,
		minionIsBusy: false
	};
	return user;
}

describe('tree clearing fees', () => {
	const redwoodPlant = Farming.Plants.find(plant => plant.name === 'Redwood tree');
	if (!redwoodPlant) {
		throw new Error('Expected redwood plant data');
	}

	const basePatch: IPatchDataDetailed = {
		ready: true,
		readyIn: null,
		readyAt: null,
		patchName: 'redwood',
		friendlyName: 'Redwood patch',
		plant: redwoodPlant,
		lastPlanted: redwoodPlant.name,
		patchPlanted: true,
		plantTime: Date.now(),
		lastQuantity: 1,
		lastUpgradeType: null,
		lastPayment: false
	};

	const mutableGlobal = globalThis as any;
	let originalMUserFetch = mutableGlobal.mUserFetch;

	beforeEach(() => {
		vi.restoreAllMocks();
		originalMUserFetch = mutableGlobal.mUserFetch;
		mutableGlobal.globalClient = { emit: vi.fn(), channels: { cache: new Map() } };
		mutableGlobal.prisma = {
			clientStorage: {
				findFirst: vi.fn().mockResolvedValue({ id: '1', farming_loot_bank: {} }),
				update: vi.fn().mockResolvedValue({ id: '1' })
			},
			farmedCrop: {
				update: vi.fn().mockResolvedValue(undefined)
			},
			userStats: {
				update: vi.fn().mockResolvedValue({})
			}
		};
	});

	afterEach(() => {
		mutableGlobal.prisma = undefined;
		mutableGlobal.globalClient = undefined;
		mutableGlobal.mUserFetch = originalMUserFetch;
	});

	it('only removes the tree clearing fee once during manual replant', async () => {
		const user = createStubUser({ gp: 5000, farmingLevel: 99, woodcuttingLevel: 1 });
		mutableGlobal.mUserFetch = vi.fn().mockResolvedValue(user);

		const prepared = await prepareFarmingStep({
			user: user as unknown as MUser,
			plant: redwoodPlant,
			quantity: 1,
			pay: false,
			patchDetailed: basePatch,
			maxTripLength: Time.Minute * 60,
			availableBank: new Bank({ Coins: 5000, 'Redwood tree seed': 1 }),
			compostTier: 'compost' as CropUpgradeType
		});
		if (!prepared.success) {
			throw new Error(`Preparation failed: ${prepared.error}`);
		}

		const treeFee = prepared.data.treeChopFee;
		expect(treeFee).toBe(2000);

		user.user.GP -= treeFee;
		user.GP -= treeFee;

		const removeSpy = vi.spyOn(user, 'removeItemsFromBank');
		vi.spyOn(Math, 'random').mockReturnValue(1);

		const task: FarmingActivityTaskOptions = {
			id: 1,
			type: 'Farming',
			userID: user.id,
			channelID: '123',
			plantsName: redwoodPlant.name,
			quantity: 1,
			upgradeType: null,
			payment: false,
			treeChopFeePaid: treeFee,
			patchType: {
				lastPlanted: basePatch.lastPlanted,
				patchPlanted: true,
				plantTime: basePatch.plantTime,
				lastQuantity: basePatch.lastQuantity,
				lastUpgradeType: null,
				lastPayment: false
			},
			planting: true,
			currentDate: Date.now(),
			finishDate: Date.now() + Time.Minute * 5,
			duration: Time.Minute * 5,
			autoFarmed: false
		};

		await (farmingTask.run as (data: FarmingActivityTaskOptions) => Promise<void>)(task);

		expect(removeSpy).not.toHaveBeenCalled();
		expect(user.user.GP).toBe(5000 - treeFee);
	});
});
