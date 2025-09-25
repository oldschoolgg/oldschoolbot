const { FakeBank, diaryStub } = vi.hoisted(() => {
	class FakeBank {
		private data: Map<string, number>;
		private frozen = false;

		constructor(initial?: FakeBank | Record<string | number, number>) {
			this.data = new Map();
			if (!initial) {
				return;
			}
			if (initial instanceof FakeBank) {
				this.data = new Map(initial.data);
				return;
			}
			for (const [rawKey, rawQty] of Object.entries(initial)) {
				const qty = Number(rawQty);
				if (!Number.isFinite(qty) || qty <= 0) continue;
				this.data.set(this.normalize(rawKey), qty);
			}
		}

		private normalize(item: unknown): string {
			if (typeof item === 'number') return item.toString();
			if (typeof item === 'string') return item;
			if (item && typeof item === 'object') {
				const candidate = item as { id?: unknown; name?: unknown };
				if (candidate.id !== undefined) return this.normalize(candidate.id);
				if (candidate.name !== undefined) return this.normalize(candidate.name);
			}
			throw new Error(`Unsupported bank item: ${String(item)}`);
		}

		private assertMutable() {
			if (this.frozen) throw new Error('Tried to mutate a frozen Bank.');
		}

		private setQuantity(key: string, quantity: number) {
			if (quantity <= 0) {
				this.data.delete(key);
				return;
			}
			this.data.set(key, quantity);
		}

		add(item: unknown, quantity = 1): this {
			if (item instanceof FakeBank) {
				this.assertMutable();
				for (const [key, qty] of item.data.entries()) {
					this.setQuantity(key, (this.data.get(key) ?? 0) + qty);
				}
				return this;
			}
			if (quantity <= 0) return this;
			this.assertMutable();
			const key = this.normalize(item);
			this.setQuantity(key, (this.data.get(key) ?? 0) + quantity);
			return this;
		}

		amount(item: unknown): number {
			const key = this.normalize(item);
			return this.data.get(key) ?? 0;
		}

		has(other: FakeBank | Record<string | number, number>): boolean {
			const otherBank = other instanceof FakeBank ? other : new FakeBank(other);
			for (const [key, qty] of otherBank.data.entries()) {
				if ((this.data.get(key) ?? 0) < qty) return false;
			}
			return true;
		}

		clone(): FakeBank {
			return new FakeBank(this);
		}

		multiply(multiplier: number): this {
			this.assertMutable();
			for (const [key, qty] of Array.from(this.data.entries())) {
				this.setQuantity(key, qty * multiplier);
			}
			return this;
		}

		items(): [{ id: string; name: string }, number][] {
			return Array.from(this.data.entries())
				.filter(([, qty]) => qty > 0)
				.map(([key, qty]) => [{ id: key, name: key }, qty]);
		}

		toString(): string {
			const parts = this.items().map(([item, qty]) => `${qty.toLocaleString()}x ${item.name}`);
			return parts.length > 0 ? parts.join(', ') : 'No items';
		}

		toJSON(): Record<string, number> {
			return Object.fromEntries(this.data.entries());
		}

		freeze(): this {
			this.frozen = true;
			return this;
		}

		get length(): number {
			return this.data.size;
		}
	}

	const diary = {
		name: 'Ardougne Diary',
		elite: { name: 'Elite' }
	};

	return { FakeBank, diaryStub: diary };
});

vi.mock(
	'oldschooljs',
	() => {
		const Monsters = {
			Hespori: {
				id: 0,
				kill: vi.fn(() => new FakeBank())
			}
		};
		const convertXPtoLVL = (xp: number) => {
			if (!Number.isFinite(xp) || xp <= 0) return 1;
			return Math.max(1, Math.min(120, Math.floor(xp / 100_000) + 1));
		};
		const calcCombatLevel = () => 3;
		return {
			__esModule: true,
			Bank: FakeBank,
			Monsters,
			convertXPtoLVL,
			calcCombatLevel,
			convertLVLtoXP: () => 0
		};
	},
	{ virtual: true }
);

vi.mock('@/lib/diaries.js', () => ({
	__esModule: true,
	ArdougneDiary: diaryStub,
	userhasDiaryTier: vi.fn().mockResolvedValue([false, '', diaryStub])
}));

vi.mock('@/lib/skilling/skills/farming/index.js', () => {
	const redwoodPlant = {
		id: 29668,
		level: 90,
		plantXp: 230,
		checkXp: 22_450,
		harvestXp: 0,
		inputItems: new FakeBank({ 'Redwood tree seed': 1 }).freeze(),
		outputLogs: 'Redwood logs',
		treeWoodcuttingLevel: 90,
		name: 'Redwood tree',
		aliases: ['redwood tree', 'redwood'],
		petChance: 5000,
		seedType: 'redwood',
		growthTime: 6400,
		numOfStages: 11,
		chance1: 0,
		chance99: 0,
		chanceOfDeath: 8,
		protectionPayment: new FakeBank({ Dragonfruit: 6 }).freeze(),
		woodcuttingXp: 380,
		needsChopForHarvest: true,
		fixedOutput: false,
		givesLogs: true,
		givesCrops: false,
		defaultNumOfPatches: 0,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: false,
		additionalPatchesByQP: [] as Array<[number, number]>,
		additionalPatchesByFarmLvl: [] as Array<[number, number]>,
		additionalPatchesByFarmGuildAndLvl: [[85, 1]] as Array<[number, number]>,
		timePerPatchTravel: 10,
		timePerHarvest: 15
	};
	const Farming = {
		aliases: ['farming'],
		Plants: [redwoodPlant],
		maleFarmerItems: {},
		femaleFarmerItems: {},
		name: 'Farming'
	};
	return {
		__esModule: true,
		default: Farming
	};
});

vi.mock('@/lib/util/handleTripFinish.js', () => ({
	__esModule: true,
	handleTripFinish: vi.fn()
}));
vi.mock('@/lib/util/updateBankSetting.js', () => ({
	__esModule: true,
	updateBankSetting: vi.fn()
}));
vi.mock('@/lib/util/addSubTaskToActivityTask.js', () => ({
	__esModule: true,
	default: vi.fn()
}));
vi.mock('@/lib/util/webhook.js', () => ({
	__esModule: true,
	sendToChannelID: vi.fn()
}));
vi.mock('@/lib/combat_achievements/combatAchievements.js', () => ({
	__esModule: true,
	combatAchievementTripEffect: vi.fn().mockResolvedValue(null)
}));
vi.mock('@/lib/canvas/chatHeadImage.js', () => ({
	__esModule: true,
	default: vi.fn()
}));
vi.mock('@/mahoji/mahojiSettings.js', () => ({
	__esModule: true,
	userStatsBankUpdate: vi.fn(),
	userHasGracefulEquipped: vi.fn().mockReturnValue(false)
}));

import { Time } from '@oldschoolgg/toolkit/datetime';
import type { CropUpgradeType } from '@prisma/client';

import type { MUser } from '../../src/lib/MUser.js';
import type { IPatchDataDetailed } from '../../src/lib/minions/farming/types.js';
import { prepareFarmingStep } from '../../src/lib/minions/functions/farmingTripHelpers.js';
import Farming from '../../src/lib/skilling/skills/farming/index.js';
import { SkillsEnum } from '../../src/lib/skilling/types.js';
import type { FarmingActivityTaskOptions } from '../../src/lib/types/minions.js';
import { farmingTask } from '../../src/tasks/minions/farmingActivity.js';

const Bank = FakeBank;

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
