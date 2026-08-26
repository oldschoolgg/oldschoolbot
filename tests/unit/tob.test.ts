import { Bank, itemID } from 'oldschooljs';
import { afterEach, describe, expect, test, vi } from 'vitest';

import './setup.js';

import { FAKE_TOB_HOST_ID, TOB_FAKE_MASS_PURPLE_KC_CUTOFF, TOBUniques } from '@/lib/data/tob.js';
import { TheatreOfBlood } from '@/lib/simulation/tob.js';
import { tobTask } from '@/tasks/minions/minigames/tobActivity.js';

const fakeRng = {
	percentChance: () => true,
	roll: () => false
} as unknown as RNGProvider;

function hasTobUnique(bank: Bank) {
	return bank.items().some(([item]) => TOBUniques.includes(item.id));
}

function createMockTobUser(id: string, tobKC = 0) {
	return {
		id,
		mention: `<@${id}>`,
		badgedUsername: id,
		cl: new Bank(),
		allItemsOwned: new Bank(),
		toString: () => `<@${id}>`,
		getAttackStyles: () => ['attack'],
		fetchMinigames: vi.fn(async () => ({ tob: tobKC, tob_hard: 0 })),
		fetchMinigameScore: vi.fn(async () => tobKC),
		statsBankUpdate: vi.fn(async () => undefined),
		statsUpdate: vi.fn(async () => undefined),
		incrementMinigameScore: vi.fn(async () => undefined),
		addXPCounter: vi.fn(async () => undefined),
		addItemsToBank: vi.fn(async () => ({
			itemsAdded: new Bank(),
			previousCL: new Bank()
		}))
	} as unknown as MUser & {
		addItemsToBank: ReturnType<typeof vi.fn>;
		fetchMinigames: ReturnType<typeof vi.fn>;
	};
}

describe('TheatreOfBlood', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	test('does not award purples to users outside uniqueEligibleUserIDs', () => {
		const result = TheatreOfBlood.complete({
			hardMode: false,
			team: [
				{ id: 'excluded_user', deaths: [] },
				{ id: 'eligible_user', deaths: [] }
			],
			uniqueEligibleUserIDs: ['eligible_user'],
			rng: fakeRng
		});

		expect(hasTobUnique(new Bank(result.loot.eligible_user))).toBe(true);
		expect(hasTobUnique(new Bank(result.loot.excluded_user))).toBe(false);
	});

	test('fake learner masses roll with the fake host but do not give fake-host loot to a real user', async () => {
		const realUser = createMockTobUser('123456789012345678', TOB_FAKE_MASS_PURPLE_KC_CUTOFF - 1);
		vi.stubGlobal(
			'mUserFetch',
			vi.fn(async (userID: string) => {
				if (userID === realUser.id) return realUser;
				throw new Error(`Unexpected user fetch: ${userID}`);
			})
		);
		vi.stubGlobal('prisma', {
			lootTrack: {
				findFirst: vi.fn(async () => null),
				create: vi.fn(async () => undefined),
				update: vi.fn(async () => undefined)
			}
		});
		vi.spyOn(global.ClientSettings, 'updateBankSetting').mockResolvedValue();

		const realUserLoot = new Bank()
			.add('Vial of blood', 50)
			.add('Death rune', 500)
			.add('Blood rune', 500)
			.add('Coal', 500)
			.add('Gold ore', 300)
			.add('Swamp tar', 500)
			.add('Potato cactus', 50);
		const fakeHostLoot = new Bank().add('Scythe of vitur (uncharged)');
		const completeSpy = vi.spyOn(TheatreOfBlood, 'complete').mockReturnValue({
			loot: {
				[realUser.id]: realUserLoot,
				[FAKE_TOB_HOST_ID]: fakeHostLoot
			},
			percentChanceOfUnique: 11,
			totalDeaths: 0,
			teamPoints: 44
		});
		const handleTripFinish = vi.fn(async () => undefined);

		await tobTask.run(
			{
				type: 'TheatreOfBlood',
				id: 1,
				userID: realUser.id,
				channelId: 'channel_id',
				duration: 1000,
				finishDate: Date.now(),
				leader: realUser.id,
				users: [realUser.id],
				isFakeMass: true,
				hardMode: false,
				fakeDuration: 1000,
				wipedRooms: [null],
				deaths: [[[], []]],
				quantity: 1
			},
			{ user: realUser, handleTripFinish, rng: fakeRng }
		);

		const completeOptions = completeSpy.mock.calls[0][0];
		expect(completeOptions.team.map(member => member.id)).toEqual([realUser.id, FAKE_TOB_HOST_ID]);
		expect(completeOptions.uniqueEligibleUserIDs).toEqual([realUser.id, FAKE_TOB_HOST_ID]);

		expect(realUser.addItemsToBank).toHaveBeenCalledOnce();
		const bankedLoot = realUser.addItemsToBank.mock.calls[0][0].items as Bank;
		expect(bankedLoot.has(itemID('Vial of blood'))).toBe(true);
		expect(bankedLoot.has(itemID('Scythe of vitur (uncharged)'))).toBe(false);
	});
});
