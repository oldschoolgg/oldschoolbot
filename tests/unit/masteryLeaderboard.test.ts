import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { masteryKey } from '../../src/lib/constants.js';
import { masteryLb } from '../../src/mahoji/commands/leaderboard.js';

const mockGetUsername = vi.fn(async (id: string) => `User ${id}`);
const mockGetUsernameSync = vi.fn((id: string) => `User ${id}`);

vi.mock('../../src/lib/util.js', () => ({
	getUsername: mockGetUsername,
	getUsernameSync: mockGetUsernameSync
}));

describe('masteryLb', () => {
	const originalPrisma = global.prisma;
	const originalRoboChimp = global.roboChimpClient;

	beforeEach(() => {
		mockGetUsername.mockClear();
		mockGetUsernameSync.mockClear();
	});

	afterEach(() => {
		global.prisma = originalPrisma;
		global.roboChimpClient = originalRoboChimp;
		vi.clearAllMocks();
	});

	it('returns mastery leaderboard for mains', async () => {
		const makePaginatedMessage = vi.fn(async ({ pages }) => pages[0]());
		const interaction = { makePaginatedMessage } as unknown as MInteraction;

		const roboFindMany = vi.fn().mockResolvedValue([
			{ id: BigInt(1), osb_mastery: 75.5, bso_mastery: 70 },
			{ id: BigInt(2), osb_mastery: 74, bso_mastery: 70 }
		]);

		global.roboChimpClient = {
			user: {
				findMany: roboFindMany
			}
		} as any;

		global.prisma = {
			user: {
				findMany: vi.fn()
			}
		} as any;

		const result = await masteryLb(interaction, false);

		expect(roboFindMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { [masteryKey]: { not: null } },
				orderBy: { [masteryKey]: 'desc' },
				take: 50,
				select: {
					id: true,
					osb_mastery: true,
					bso_mastery: true
				}
			})
		);
		expect(makePaginatedMessage).toHaveBeenCalledTimes(1);

		const embed = result.embeds[0];
		expect(embed.data.title).toBe('Mastery Leaderboard');
		expect(embed.data.description).toContain('75.500% mastery');
		expect(embed.data.description).toContain('User 1');
		expect(embed.data.title).not.toContain('Ironmen Only');
	});

	it('filters mastery leaderboard for ironmen', async () => {
		const makePaginatedMessage = vi.fn(async ({ pages }) => pages[0]());
		const interaction = { makePaginatedMessage } as unknown as MInteraction;

		const roboFindMany = vi
			.fn()
			.mockResolvedValueOnce([
				{ id: BigInt(1), osb_mastery: 81.111, bso_mastery: 70 },
				{ id: BigInt(2), osb_mastery: 80.5, bso_mastery: 70 },
				{ id: BigInt(3), osb_mastery: 79.123, bso_mastery: 70 }
			])
			.mockResolvedValueOnce([]);

		const prismaFindMany = vi.fn().mockResolvedValue([{ id: '2' }, { id: '3' }]);

		global.roboChimpClient = {
			user: {
				findMany: roboFindMany
			}
		} as any;

		global.prisma = {
			user: {
				findMany: prismaFindMany
			}
		} as any;

		const result = await masteryLb(interaction, true);

		expect(roboFindMany).toHaveBeenNthCalledWith(
			1,
			expect.objectContaining({
				skip: 0,
				take: 100
			})
		);
		expect(roboFindMany).toHaveBeenNthCalledWith(
			2,
			expect.objectContaining({
				skip: 3,
				take: 100
			})
		);
		expect(prismaFindMany).toHaveBeenCalledWith({
			where: {
				id: { in: ['1', '2', '3'] },
				minion_ironman: true
			},
			select: { id: true }
		});

		const embed = result.embeds[0];
		expect(embed.data.title).toBe('Mastery Leaderboard (Ironmen Only)');
		expect(embed.data.description).not.toContain('User 1');
		expect(embed.data.description).toContain('User 2');
		expect(embed.data.description).toContain('User 3');
	});
});
