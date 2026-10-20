import { describe, expect, test, vi } from 'vitest';

import { doMenuWrapper } from '@/lib/menuWrapper.js';

describe('doMenuWrapper', () => {
	test('excludes blacklisted users before paginating', async () => {
		const originalCache = global.Cache;
		global.Cache = {
			getAllBlacklistedUsers: async () => new Set(['2']),
			getBadgedUsername: async (id: string) => `user-${id}`
		} as any;

		try {
			const makePaginatedMessage = vi.fn(async (_options: any) => 'paginated');
			const result = await doMenuWrapper({
				ironmanOnly: false,
				interaction: { makePaginatedMessage } as any,
				title: 'Test Leaderboard',
				users: [
					{ id: '1', score: 30 },
					{ id: '2', score: 20 },
					{ id: '3', score: 10 }
				]
			});

			expect(result).toBe('paginated');
			expect(makePaginatedMessage).toHaveBeenCalledOnce();

			const [{ pages }] = makePaginatedMessage.mock.calls[0];
			const page = await pages[0]();
			const description = page.embeds[0].data.description;

			expect(description).toContain('1. **user-1:** 30');
			expect(description).toContain('2. **user-3:** 10');
			expect(description).not.toContain('user-2');
		} finally {
			global.Cache = originalCache;
		}
	});

	test('returns the empty leaderboard message when all users are blacklisted', async () => {
		const originalCache = global.Cache;
		global.Cache = {
			getAllBlacklistedUsers: async () => new Set(['1']),
			getBadgedUsername: async (id: string) => `user-${id}`
		} as any;

		try {
			const makePaginatedMessage = vi.fn((_options: any) => undefined);
			const result = await doMenuWrapper({
				ironmanOnly: false,
				interaction: { makePaginatedMessage } as any,
				title: 'Test Leaderboard',
				users: [{ id: '1', score: 30 }]
			});

			expect(result).toBe('There are no users on this leaderboard.');
			expect(makePaginatedMessage).not.toHaveBeenCalled();
		} finally {
			global.Cache = originalCache;
		}
	});
});
