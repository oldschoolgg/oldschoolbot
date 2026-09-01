import { beforeAll, describe, expect, it } from 'vitest';

import { encryptToken } from '@/modules/encryption.js';

const TEST_USER_ID = '123456789012345678';
const TEST_USER_ID_2 = '987654321098765432';

let app: any;

// const app = await startServer(MathRNG.randInt(2000, 65000));
// await initPrismaClients();
// globalThis.globalClient = {} as any;

async function createTestUser(userId: string, bot: 'osb' | 'bso' = 'osb') {
	await roboChimpClient.user.upsert({
		where: { id: BigInt(userId) },
		create: {
			id: BigInt(userId),
			bits: [],
			github_id: null,
			patreon_id: null,
			user_group_id: null,
			migrated_user_id: null,
			leagues_completed_tasks_ids: [],
			leagues_points_balance_bso: 0,
			leagues_points_total: 0,
			leagues_points_balance_osb: 0,
			react_emoji_id: null,
			osb_total_level: null,
			bso_total_level: null,
			osb_total_xp: null,
			bso_total_xp: null,
			osb_cl_percent: null,
			bso_cl_percent: null,
			osb_mastery: null,
			bso_mastery: null,
			store_bitfield: [],
			testing_points: 0,
			testing_points_balance: 0,
			perk_tier: 0,
			premium_balance_tier: null,
			premium_balance_expiry_date: null
		},
		update: {}
	});

	if (bot === 'osb') {
		await osbClient.user.upsert({
			where: { id: userId },
			create: {
				id: userId,
				minion_hasBought: true,
				minion_ironman: false
			},
			update: {}
		});
	} else {
		await bsoClient.user.upsert({
			where: { id: userId },
			create: {
				id: userId,
				minion_hasBought: true,
				minion_ironman: false
			},
			update: {}
		});
	}

	return userId;
}

async function createAuthToken(userId: string): Promise<string> {
	return encryptToken({ user_id: userId });
}

async function testRequest(
	path: string,
	options?: {
		method?: string;
		body?: any;
		headers?: Record<string, string>;
		authToken?: string;
	}
) {
	if (typeof path !== 'string' || !path.startsWith('/')) {
		throw new Error('Path must be a string starting with /');
	}

	const headers: Record<string, string> = {
		'content-type': 'application/json',
		...(options?.headers ?? {})
	};

	if (options?.authToken) {
		headers['cookie'] = `token=${options.authToken}`;
	}

	const result = await app.request(path, {
		method: (options?.method ?? 'GET') as any,
		headers,
		body: options?.body ? JSON.stringify(options.body) : undefined
	});

	return {
		status: result.status,
		text: () => result.text(),
		json: () => result.json()
	};
}

// afterAll(async () => {
// 	for (const c of [globalThis.osbClient, globalThis.bsoClient, globalThis.roboChimpClient]) {
// 		if (c?.$disconnect) await c.$disconnect();
// 	}
// });

describe.skip('User Config Update (PATCH /:userId/:bot/minion)', () => {
	let testUser1Token: string;

	beforeAll(async () => {
		// await createTestUser(TEST_USER_ID, 'osb');
		// await createTestUser(TEST_USER_ID_2, 'osb');

		testUser1Token = await createAuthToken(TEST_USER_ID);
	});

	describe('Authentication & Authorization', () => {
		it('should reject unauthenticated requests', async () => {
			const res = await testRequest(`/user/${TEST_USER_ID}/osb/minion`, {
				method: 'PATCH',
				body: { favorite_items: [1, 2, 3] }
			});
			expect(res.status).toBe(401);
		});

		it('should reject when user tries to edit another user config', async () => {
			const res = await testRequest(`/user/${TEST_USER_ID_2}/osb/minion`, {
				method: 'PATCH',
				body: { favorite_items: [1, 2, 3] },
				authToken: testUser1Token
			});
			expect(res.status).toBe(403);
			const data: any = await res.json();
			expect(data.message).toContain('only edit your own');
		});

		it('should reject invalid user ID format', async () => {
			const res = await testRequest('/user/invalid/osb/minion', {
				method: 'PATCH',
				body: { favorite_items: [1, 2, 3] },
				authToken: testUser1Token
			});
			expect(res.status).toBe(400);
		});

		it('should reject invalid bot parameter', async () => {
			const res = await testRequest(`/user/${TEST_USER_ID}/invalid/minion`, {
				method: 'PATCH',
				body: { favorite_items: [1, 2, 3] },
				authToken: testUser1Token
			});
			expect(res.status).toBe(400);
		});
	});

	describe('Request Validation', () => {
		it('should reject empty update', async () => {
			const res = await testRequest(`/user/${TEST_USER_ID}/osb/minion`, {
				method: 'PATCH',
				body: {},
				authToken: testUser1Token
			});
			expect(res.status).toBe(400);
			const data: any = await res.json();
			expect(data.message).toContain('No configuration fields');
		});

		it('should reject unknown fields (strict schema)', async () => {
			const res = await testRequest(`/user/${TEST_USER_ID}/osb/minion`, {
				method: 'PATCH',
				body: { unknown_field: 'value' },
				authToken: testUser1Token
			});
			expect(res.status).toBe(400);
		});

		it('should reject invalid bank_sort_method enum', async () => {
			const res = await testRequest(`/user/${TEST_USER_ID}/osb/minion`, {
				method: 'PATCH',
				body: { bank_sort_method: 'invalid' },
				authToken: testUser1Token
			});
			expect(res.status).toBe(400);
		});

		it('should reject duplicate favorite items', async () => {
			const res = await testRequest(`/user/${TEST_USER_ID}/osb/minion`, {
				method: 'PATCH',
				body: { favorite_items: [1, 2, 2, 3] },
				authToken: testUser1Token
			});
			expect(res.status).toBe(400);
			const data: any = await res.json();
			expect(data.message).toContain('unique');
		});

		it('should reject duplicate attack styles', async () => {
			const res = await testRequest(`/user/${TEST_USER_ID}/osb/minion`, {
				method: 'PATCH',
				body: { attack_style: ['attack', 'attack', 'strength'] },
				authToken: testUser1Token
			});
			expect(res.status).toBe(400);
			const data: any = await res.json();
			expect(data.message).toContain('unique');
		});

		it('should reject too many favorite items', async () => {
			const res = await testRequest(`/user/${TEST_USER_ID}/osb/minion`, {
				method: 'PATCH',
				body: { favorite_items: Array.from({ length: 101 }, (_, i) => i + 1) },
				authToken: testUser1Token
			});
			expect(res.status).toBe(400);
		});

		it('should reject invalid compost type', async () => {
			const res = await testRequest(`/user/${TEST_USER_ID}/osb/minion`, {
				method: 'PATCH',
				body: { default_compost: 'invalid' },
				authToken: testUser1Token
			});
			expect(res.status).toBe(400);
		});
	});

	describe('Successful Updates', () => {
		it('should update favorite_items', async () => {
			const res = await testRequest(`/user/${TEST_USER_ID}/osb/minion`, {
				method: 'PATCH',
				body: { favorite_items: [1, 2, 3] },
				authToken: testUser1Token
			});
			expect(res.status).toBe(200);
			const data: any = await res.json();
			expect(data.success).toBe(true);
			expect(data.updated_fields).toContain('favorite_items');
			expect(data.config.favorite_items).toEqual([1, 2, 3]);
		});

		it('should update bank_sort_method to null', async () => {
			const res = await testRequest(`/user/${TEST_USER_ID}/osb/minion`, {
				method: 'PATCH',
				body: { bank_sort_method: null },
				authToken: testUser1Token
			});
			expect(res.status).toBe(200);
			const data: any = await res.json();
			expect(data.config.bank_sort_method).toBeNull();
		});

		it('should update bank_sort_method to valid value', async () => {
			const res = await testRequest(`/user/${TEST_USER_ID}/osb/minion`, {
				method: 'PATCH',
				body: { bank_sort_method: 'value' },
				authToken: testUser1Token
			});
			expect(res.status).toBe(200);
			const data: any = await res.json();
			expect(data.config.bank_sort_method).toBe('value');
		});

		it('should update attack_style', async () => {
			const res = await testRequest(`/user/${TEST_USER_ID}/osb/minion`, {
				method: 'PATCH',
				body: { attack_style: ['attack', 'strength', 'defence'] },
				authToken: testUser1Token
			});
			expect(res.status).toBe(200);
			const data: any = await res.json();
			expect(data.config.attack_style).toEqual(['attack', 'strength', 'defence']);
		});

		it('should update default_compost', async () => {
			const res = await testRequest(`/user/${TEST_USER_ID}/osb/minion`, {
				method: 'PATCH',
				body: { default_compost: 'ultracompost' },
				authToken: testUser1Token
			});
			expect(res.status).toBe(200);
			const data: any = await res.json();
			expect(data.config.default_compost).toBe('ultracompost');
		});

		it('should update auto_farm_filter', async () => {
			const res = await testRequest(`/user/${TEST_USER_ID}/osb/minion`, {
				method: 'PATCH',
				body: { auto_farm_filter: 'Replant' },
				authToken: testUser1Token
			});
			expect(res.status).toBe(200);
			const data: any = await res.json();
			expect(data.config.auto_farm_filter).toBe('Replant');
		});

		it('should update multiple fields at once', async () => {
			const res = await testRequest(`/user/${TEST_USER_ID}/osb/minion`, {
				method: 'PATCH',
				body: {
					favorite_items: [10, 20, 30],
					favorite_alchables: [100, 200],
					bank_sort_method: 'alch',
					default_compost: 'supercompost'
				},
				authToken: testUser1Token
			});
			expect(res.status).toBe(200);
			const data: any = await res.json();
			expect(data.success).toBe(true);
			expect(data.updated_fields).toHaveLength(4);
			expect(data.config.favorite_items).toEqual([10, 20, 30]);
			expect(data.config.favorite_alchables).toEqual([100, 200]);
			expect(data.config.bank_sort_method).toBe('alch');
			expect(data.config.default_compost).toBe('supercompost');
		});

		it('should update bank_sort_weightings', async () => {
			const res = await testRequest(`/user/${TEST_USER_ID}/osb/minion`, {
				method: 'PATCH',
				body: {
					bank_sort_weightings: { item1: 10, item2: 20, item3: 30 }
				},
				authToken: testUser1Token
			});
			expect(res.status).toBe(200);
			const data: any = await res.json();
			expect(data.config.bank_sort_weightings).toEqual({ item1: 10, item2: 20, item3: 30 });
		});

		it('should update combat_options', async () => {
			const res = await testRequest(`/user/${TEST_USER_ID}/osb/minion`, {
				method: 'PATCH',
				body: { combat_options: [1, 2, 3] },
				authToken: testUser1Token
			});
			expect(res.status).toBe(200);
			const data: any = await res.json();
			expect(data.config.combat_options).toEqual([1, 2, 3]);
		});

		it('should work with BSO bot', async () => {
			await createTestUser(TEST_USER_ID, 'bso');
			const res = await testRequest(`/user/${TEST_USER_ID}/bso/minion`, {
				method: 'PATCH',
				body: { favorite_items: [5, 10, 15] },
				authToken: testUser1Token
			});
			expect(res.status).toBe(200);
			const data: any = await res.json();
			expect(data.config.favorite_items).toEqual([5, 10, 15]);
		});
	});
});
