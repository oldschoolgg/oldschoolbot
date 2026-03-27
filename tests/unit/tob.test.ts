import { Bank } from 'oldschooljs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as chestImageModule from '../../src/lib/canvas/chestImage.js';
import { resolveToBUsersForStart } from '../../src/mahoji/lib/abstracted_commands/tobCommand.js';
import { tobTask } from '../../src/tasks/minions/minigames/tobActivity.js';
import { mockMathRandom } from '../integration/util.js';

const { completeMock } = vi.hoisted(() => ({
	completeMock: vi.fn()
}));

vi.mock('@/lib/simulation/tob.js', () => ({
	TheatreOfBlood: {
		complete: completeMock
	}
}));

vi.spyOn(chestImageModule, 'drawChestLootImage').mockResolvedValue(undefined as any);

describe('ToB helpers', () => {
	it('uses exactly one real user for true solo', () => {
		const leader = { id: '1' } as MUser;
		const users = resolveToBUsersForStart(leader, 'solo');
		expect(users.map(u => u.id)).toEqual(['1']);
	});

	it('uses three internal entries for trio simulation', () => {
		const leader = { id: '1' } as MUser;
		const users = resolveToBUsersForStart(leader, 'trio');
		expect(users.map(u => u.id)).toEqual(['1', '1', '1']);
	});

	it('uses party users when not solo mode', () => {
		const leader = { id: '1' } as MUser;
		const partyUsers = [{ id: '1' }, { id: '2' }] as MUser[];
		const users = resolveToBUsersForStart(leader, undefined, partyUsers);
		expect(users.map(u => u.id)).toEqual(['1', '2']);
	});
});

describe('tobTask duplicate user hardening', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not double/triple apply persistence updates when users contain duplicate IDs', async () => {
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
				findFirst: vi.fn(async (_args: any) => null),
				create: vi.fn(async (_args: any) => ({})),
				update: vi.fn(async (_args: any) => ({}))
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

		const unmockMathRandom = mockMathRandom(0);
		try {
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

			const findFirstCalls = prismaMock.lootTrack.findFirst.mock.calls as Array<[any]>;
			const userScopedTrackCalls = findFirstCalls.filter(([args]) => args?.where?.user_id !== null);
			expect(userScopedTrackCalls).toHaveLength(1);
			expect(userScopedTrackCalls[0]?.[0]?.where?.user_id).toBe(BigInt('123'));

			expect(handleTripFinish).toHaveBeenCalledTimes(1);
		} finally {
			unmockMathRandom();
		}
	});
});
