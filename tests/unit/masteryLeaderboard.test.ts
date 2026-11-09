import { afterEach, describe, expect, it, vi } from 'vitest';

import { masteryKey } from '../../src/lib/constants.js';
import { masteryLb } from '../../src/mahoji/commands/leaderboard.js';

// mock the TS file, not .js
vi.mock('../../src/lib/util.ts', () => ({
	getUsername: vi.fn(async (id: string) => `User ${id}`),
	getUsernameSync: vi.fn((id: string) => `User ${id}`)
}));

describe('masteryLb', () => {
	const originalPrisma = global.prisma;
	const originalRoboChimp = global.roboChimpClient;

	afterEach(() => {
		global.prisma = originalPrisma;
		global.roboChimpClient = originalRoboChimp;
		vi.clearAllMocks();
	});

	it('returns mastery leaderboard for mains', async () => {
		const makePaginatedMessage = vi.fn(async ({ pages }) => pages[0]());
		const interaction = { makePaginatedMessage } as unknown as MInteraction;

		const roboFindMany = vi.fn().mockResolvedValue([
			{ id: BigInt(1), [masteryKey]: 75.5 },
			{ id: BigInt(2), [masteryKey]: 74 }
		]);

		global.roboChimpClient = {
			user: {
				findMany: roboFindMany
			}
		} as any;

		// prisma not used in this branch, but define to keep code happy
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
					[masteryKey]: true
				}
			})
		);
		expect(makePaginatedMessage).toHaveBeenCalledTimes(1);

		// result is SpecialResponse; cast to any for embed check
		expect(typeof result).toBe('object');
		const embed = (result as any).embeds[0];

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
				{ id: BigInt(1), [masteryKey]: 81.111 },
				{ id: BigInt(2), [masteryKey]: 80.5 },
				{ id: BigInt(3), [masteryKey]: 79.123 }
			])
			.mockResolvedValueOnce([]); // second page empty → stop

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

		// first batch
		expect(roboFindMany).toHaveBeenNthCalledWith(
			1,
			expect.objectContaining({
				skip: 0,
				take: 100
			})
		);
		// second batch
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

		expect(typeof result).toBe('object');
		const embed = (result as any).embeds[0];

		expect(embed.data.title).toBe('Mastery Leaderboard (Ironmen Only)');
		expect(embed.data.description).not.toContain('User 1');
		expect(embed.data.description).toContain('User 2');
		expect(embed.data.description).toContain('User 3');
	});
});
