import { Bank } from 'oldschooljs';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import type { MUser } from '../../src/lib/MUser.js';
import type { FarmingActivityTaskOptions } from '../../src/lib/types/minions.js';

const handleTripFinishMock = vi.fn();
const updateBankSettingMock = vi.fn();
const addSubTaskMock = vi.fn();
const sendToChannelMock = vi.fn();
const userStatsBankUpdateMock = vi.fn();
const calcVariableYieldMock = vi.fn().mockReturnValue(0);

const redwoodPlant = {
	id: 1,
	name: 'Redwood tree',
	aliases: ['redwood'],
	seedType: 'redwood',
	plantXp: 0,
	checkXp: 0,
	harvestXp: 0,
	herbXp: undefined,
	herbLvl: undefined,
	inputItems: new Bank(),
	outputLogs: 100,
	outputLogsQuantity: 100,
	outputRoots: undefined,
	givesLogs: true,
	givesCrops: false,
	fixedOutput: false,
	variableYield: false,
	numOfStages: 2,
	chanceOfDeath: 16,
	chance1: 0,
	chance99: 0,
	treeWoodcuttingLevel: 90,
	needsChopForHarvest: true,
	petChance: 1000,
	growthTime: 0,
	timePerPatchTravel: 0,
	timePerHarvest: 0,
	woodcuttingXp: 1,
	canPayFarmer: true,
	canCompostPatch: true,
	canCompostandPay: false
} as const;

vi.mock('@/lib/skilling/skills/farming/index.js', () => ({
	Farming: {
		Plants: [redwoodPlant],
		calcVariableYield: calcVariableYieldMock
	}
}));

vi.mock('@/lib/util/handleTripFinish.js', () => ({
	handleTripFinish: handleTripFinishMock
}));
vi.mock('../../src/lib/util/handleTripFinish.js', () => ({
	handleTripFinish: handleTripFinishMock
}));

vi.mock('@/lib/util/updateBankSetting.js', () => ({
	updateBankSetting: updateBankSettingMock
}));
vi.mock('@/lib/util/updateBankSetting.ts', () => ({
	updateBankSetting: updateBankSettingMock
}));
vi.mock('../../src/lib/util/updateBankSetting.js', () => ({
	updateBankSetting: updateBankSettingMock
}));

vi.mock('@/lib/util/addSubTaskToActivityTask.js', () => ({
	default: addSubTaskMock
}));

vi.mock('@/lib/util/webhook.js', () => ({
	sendToChannelID: sendToChannelMock
}));
vi.mock('../../src/lib/util/webhook.js', () => ({
	sendToChannelID: sendToChannelMock
}));

vi.mock('@/lib/util/clientSettings.js', () => ({
	mahojiClientSettingsFetch: vi.fn().mockResolvedValue({ farming_loot_bank: {} }),
	mahojiClientSettingsUpdate: vi.fn().mockResolvedValue(undefined)
}));
vi.mock('@/lib/util/clientSettings.ts', () => ({
	mahojiClientSettingsFetch: vi.fn().mockResolvedValue({ farming_loot_bank: {} }),
	mahojiClientSettingsUpdate: vi.fn().mockResolvedValue(undefined)
}));
vi.mock('../../src/lib/util/clientSettings.js', () => ({
	mahojiClientSettingsFetch: vi.fn().mockResolvedValue({ farming_loot_bank: {} }),
	mahojiClientSettingsUpdate: vi.fn().mockResolvedValue(undefined)
}));
vi.mock('../../src/lib/util/clientSettings.ts', () => ({
	mahojiClientSettingsFetch: vi.fn().mockResolvedValue({ farming_loot_bank: {} }),
	mahojiClientSettingsUpdate: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('@/mahoji/mahojiSettings.js', () => ({
	userStatsBankUpdate: userStatsBankUpdateMock
}));
vi.mock('../../src/mahoji/mahojiSettings.js', () => ({
	userStatsBankUpdate: userStatsBankUpdateMock
}));
vi.mock('../../src/mahoji/mahojiSettings.ts', () => ({
	userStatsBankUpdate: userStatsBankUpdateMock
}));

vi.mock('@/lib/util/rng.js', () => ({
	randInt: vi.fn().mockReturnValue(5),
	roll: vi.fn().mockReturnValue(false)
}));
vi.mock('../../src/lib/util/rng.js', () => ({
	randInt: vi.fn().mockReturnValue(5),
	roll: vi.fn().mockReturnValue(false)
}));

vi.mock('@/lib/util.ts', () => ({
	skillingPetDropRate: vi.fn().mockReturnValue({ petDropRate: Number.POSITIVE_INFINITY })
}));
vi.mock('../../src/lib/util.ts', () => ({
	skillingPetDropRate: vi.fn().mockReturnValue({ petDropRate: Number.POSITIVE_INFINITY })
}));

vi.mock('@/lib/skilling/skills/farming/utils/calcsFarming.js', () => ({
	calcVariableYield: calcVariableYieldMock
}));

vi.mock('@/lib/canvas/chatHeadImage.js', () => ({
	default: vi.fn().mockResolvedValue('image')
}));

vi.mock('@/lib/combat_achievements/combatAchievements.js', () => ({
	combatAchievementTripEffect: vi.fn().mockResolvedValue(undefined)
}));
vi.mock('../../src/lib/combat_achievements/combatAchievements.js', () => ({
	combatAchievementTripEffect: vi.fn().mockResolvedValue(undefined)
}));
vi.mock('../../src/lib/combat_achievements/combatAchievements.ts', () => ({
	combatAchievementTripEffect: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('@/lib/randomEvents.js', () => ({
	triggerRandomEvent: vi.fn().mockResolvedValue(undefined)
}));
vi.mock('../../src/lib/randomEvents.js', () => ({
	triggerRandomEvent: vi.fn().mockResolvedValue(undefined)
}));
vi.mock('../../src/lib/randomEvents.ts', () => ({
	triggerRandomEvent: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('@/lib/util.js', () => ({
	skillingPetDropRate: vi.fn().mockReturnValue({ petDropRate: Number.POSITIVE_INFINITY })
}));

let farmingTask: typeof import('../../src/tasks/minions/farmingActivity.js')['farmingTask'];

beforeAll(async () => {
	farmingTask = (await import('../../src/tasks/minions/farmingActivity.js')).farmingTask;
});

describe('farmingActivity tree clearing fees', () => {
	const removeItemsFromBankMock = vi.fn();
	const addItemsToBankMock = vi.fn();
	let userGP = 5_000;
	let prismaMock: any;

	const userStub = {
		id: '1',
		user: {
			get GP() {
				return userGP;
			},
			completed_ca_task_ids: [] as number[]
		},
		get GP() {
			return userGP;
		},
		minionName: 'Test Minion',
		badgedUsername: 'Tester',
		bank: new Bank(),
		cl: new Bank(),
		gear: {
			melee: {
				equippedWeapon: vi.fn().mockReturnValue(null),
				hasEquipped: vi.fn().mockReturnValue(false)
			},
			range: {
				hasEquipped: vi.fn().mockReturnValue(false)
			},
			mage: {
				hasEquipped: vi.fn().mockReturnValue(false)
			}
		},
		bitfield: [] as number[],
		skillsAsXP: {
			farming: 13_034_431,
			woodcutting: 0
		} as any,
		skillsAsLevels: {
			farming: 99,
			woodcutting: 1
		} as any,
		hasEquippedOrInBank: vi.fn().mockReturnValue(false),
		hasEquipped: vi.fn().mockReturnValue(false),
		perkTier: vi.fn().mockReturnValue(0),
		getAttackStyles: vi.fn().mockReturnValue(['accurate']),
		skillLevel: vi.fn((skill: string) => {
			if (skill === 'farming') {
				return 99;
			}
			if (skill === 'woodcutting') {
				return 1;
			}
			return 1;
		}),
		farmingContract: vi.fn().mockReturnValue({
			contract: {
				hasContract: false,
				plantToGrow: null,
				plantTier: null,
				contractsCompleted: 0
			}
		}),
		fetchStats: vi.fn().mockResolvedValue({ farming_harvest_loot_bank: {} }),
		hasEquippedOrInBankAsync: vi.fn().mockResolvedValue(false),
		toString() {
			return 'Tester';
		},
		update: vi.fn().mockResolvedValue(undefined),
		transactItems: vi.fn().mockImplementation(async () => ({ newUser: { GP: userGP } })),
		removeItemsFromBank: removeItemsFromBankMock.mockImplementation(async (bank: Bank) => {
			userGP -= bank.amount('Coins');
		}),
		addItemsToBank: addItemsToBankMock.mockImplementation(async ({ items }: { items: Bank }) => {
			userGP += items.amount('Coins');
		}),
		addXP: vi.fn().mockResolvedValue('XP'),
		addItemsToCollectionLog: vi.fn().mockResolvedValue(undefined),
		addItemsToBankCollectionLog: vi.fn().mockResolvedValue(undefined),
		incrementKC: vi.fn().mockResolvedValue(undefined),
		addXPNoNotify: vi.fn().mockResolvedValue(undefined)
	} as unknown as MUser;

	beforeEach(() => {
		prismaMock = {
			clientStorage: {
				findFirst: vi.fn().mockResolvedValue({ farming_loot_bank: {} }),
				update: vi.fn().mockResolvedValue(undefined),
				upsert: vi.fn().mockResolvedValue(undefined)
			},
			farmedCrop: {
				create: vi.fn().mockResolvedValue({ id: 1 }),
				update: vi.fn().mockResolvedValue(undefined)
			},
			user: {
				upsert: vi.fn().mockResolvedValue({
					username: 'Tester',
					badges: 0,
					minion_ironman: false
				}),
				update: vi.fn().mockResolvedValue({
					username: 'Tester',
					badges: 0,
					minion_ironman: false
				})
			},
			userStats: {
				update: vi.fn().mockResolvedValue({ farming_harvest_loot_bank: {} }),
				upsert: vi.fn().mockResolvedValue({ farming_harvest_loot_bank: {} })
			}
		};
		vi.stubGlobal('prisma', prismaMock);
		vi.stubGlobal('mUserFetch', vi.fn().mockResolvedValue(userStub));
		vi.stubGlobal('globalClient', {
			emit: vi.fn(),
			channels: { cache: new Map() },
			user: null
		});
		userGP = 5_000;
		removeItemsFromBankMock.mockClear();
		addItemsToBankMock.mockClear();
		handleTripFinishMock.mockClear();
		sendToChannelMock.mockClear();
		addSubTaskMock.mockClear();
		updateBankSettingMock.mockClear();
		userStatsBankUpdateMock.mockClear();
	});

	it('does not charge coins when planned trees died before harvest', async () => {
		const randomSpy = vi.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValue(1);

		const data: FarmingActivityTaskOptions = {
			type: 'Farming',
			plantsName: 'Redwood tree',
			patchType: {
				lastPlanted: 'Redwood tree',
				patchPlanted: true,
				plantTime: Date.now() - 1,
				lastQuantity: 1,
				lastUpgradeType: null,
				lastPayment: false
			} as any,
			quantity: 1,
			upgradeType: null,
			payment: false,
			treeChopFeePaid: 0,
			treeChopFeePlanned: 2000,
			planting: true,
			duration: 60_000,
			currentDate: Date.now(),
			id: 1,
			finishDate: Date.now() + 60_000,
			userID: '1',
			channelID: '123',
			autoFarmed: true
		};

		if ('isNew' in farmingTask) {
			await farmingTask.run(data, { user: userStub, handleTripFinish: handleTripFinishMock });
		} else {
			await farmingTask.run(data);
		}

		expect(removeItemsFromBankMock).not.toHaveBeenCalled();
		expect(addItemsToBankMock).not.toHaveBeenCalled();
		expect(sendToChannelMock).not.toHaveBeenCalled();
		expect(userStub.GP).toBe(5_000);

		randomSpy.mockRestore();
	});

	it('does not create farmed crop record when lacking GP to clear trees', async () => {
		const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(1);

		userGP = 100;

		const data: FarmingActivityTaskOptions = {
			type: 'Farming',
			plantsName: 'Redwood tree',
			patchType: {
				lastPlanted: 'Redwood tree',
				patchPlanted: true,
				plantTime: Date.now() - 1,
				lastQuantity: 1,
				lastUpgradeType: null,
				lastPayment: false,
				pid: 123
			} as any,
			quantity: 1,
			upgradeType: null,
			payment: false,
			treeChopFeePaid: 0,
			treeChopFeePlanned: 2000,
			planting: true,
			duration: 60_000,
			currentDate: Date.now(),
			id: 1,
			finishDate: Date.now() + 60_000,
			userID: '1',
			channelID: '123',
			autoFarmed: true
		};

		if ('isNew' in farmingTask) {
			await farmingTask.run(data, { user: userStub, handleTripFinish: handleTripFinishMock });
		} else {
			await farmingTask.run(data);
		}

		expect(sendToChannelMock).toHaveBeenCalledWith('123', {
			content:
				'You do not have the required woodcutting level or enough GP to clear your patches, in order to be able to plant more. You still need 2000 GP.'
		});
		expect(prismaMock.farmedCrop.create).not.toHaveBeenCalled();
		expect(handleTripFinishMock).not.toHaveBeenCalled();

		randomSpy.mockRestore();
	});
});
