import { Bank } from 'oldschooljs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const completeMock = vi.fn();

vi.mock('@/lib/simulation/tob.js', () => ({
	TheatreOfBlood: {
		complete: completeMock
	}
}));

vi.mock('@oldschoolgg/rng', async importOriginal => {
	const original = await importOriginal<typeof import('@oldschoolgg/rng')>();
	return {
		...original,
		roll: () => false,
		shuffleArr: <T>(arr: T[]) => arr
	};
});

const { tobTask } = await import('../../src/tasks/minions/minigames/tobActivity.js');
const chestImageModule = await import('../../src/lib/canvas/chestImage.js');
vi.spyOn(chestImageModule, 'drawChestLootImage').mockResolvedValue(undefined as any);

describe('tobTask duplicate user hardening', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not double/triple apply persistence updates when users contains duplicate IDs', async () => {
		const mockUser = {
			id: '123',
			mention: '<@123>',
			toString: () => '<@123>',
			cl: new Bank(),
			allItemsOwned: new Bank(),
			getAttackStyles: () => ['attack'],
			statsBankUpdate: vi.fn(async () => undefined),
			addXPCounter: vi.fn(async () => undefined),
			addItemsToBank: vi.fn(async () => undefined),
			statsUpdate: vi.fn(async () => undefined),
			incrementMinigameScore: vi.fn(async () => undefined)
		} as unknown as MUser;

		(globalThis as any).mUserFetch = vi.fn(async () => mockUser);
		(globalThis as any).ClientSettings = {
			updateBankSetting: vi.fn(async () => undefined)
		};
		const prismaMock = {
			lootTrack: {
				findFirst: vi.fn(async () => null),
				create: vi.fn(async () => ({})),
				update: vi.fn(async () => ({}))
			}
		};
		(globalThis as any).prisma = prismaMock;

		completeMock.mockReturnValue({
			percentChanceOfUnique: 11,
			loot: {
				'123': {
					'Death rune': 10,
					'Blood rune': 10,
					'Water rune': 10,
					'Air rune': 10,
					'Earth rune': 10,
					'Fire rune': 10,
					'Nature rune': 10
				}
			}
		});

		const handleTripFinish = vi.fn(async (input: any) => input);

		await tobTask.run(
			{
				channelId: '1',
				users: ['123', '123', '123'],
				hardMode: false,
				leader: '123',
				wipedRooms: [null],
				duration: 1000,
				deaths: [[[], [], []]],
				quantity: 1,
				type: 'TheatreOfBlood',
				cc: null
			} as any,
			{ handleTripFinish } as any
		);

		expect(mockUser.statsBankUpdate).toHaveBeenCalledTimes(1);
		expect(mockUser.addXPCounter).toHaveBeenCalledTimes(1);
		expect(mockUser.addItemsToBank).toHaveBeenCalledTimes(1);
		expect(mockUser.statsUpdate).toHaveBeenCalledTimes(1);
		expect(mockUser.incrementMinigameScore).toHaveBeenCalledTimes(1);

		const userScopedTrackCalls = prismaMock.lootTrack.findFirst.mock.calls.filter(
			call => call[0].where.user_id !== null
		);
		expect(userScopedTrackCalls).toHaveLength(1);
		expect(userScopedTrackCalls[0][0].where.user_id).toBe(BigInt('123'));

		expect(handleTripFinish).toHaveBeenCalledTimes(1);
	});
});
