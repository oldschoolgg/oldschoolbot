import { Stopwatch } from '@oldschoolgg/toolkit';
import { Collection, type User } from 'discord.js';
import type { Hono } from 'hono';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { startServer } from '@/http/server.js';
import { initPrismaClients } from '@/lib/prisma.js';

const mockVerifyPatreonSecret = vi.fn<(raw: string, sig?: string) => boolean>();
const mockParseStrToTier = vi.fn<(name: string) => string | null>();
// @ts-expect-error
const mockPatreonRun = vi.fn<[], Promise<string[] | null>>();
const mockPatreonChangeTier = vi.fn();
const mockPatreonRemovePerks = vi.fn();
vi.mock('../src/lib/patreon.js', () => ({
	verifyPatreonSecret: (raw: string, sig?: string) => mockVerifyPatreonSecret(raw, sig),
	parseStrToTier: (name: string) => mockParseStrToTier(name),
	patreonTask: {
		// @ts-expect-error
		run: () => mockPatreonRun(),
		changeTier: (...args: unknown[]) => mockPatreonChangeTier(...args),
		removePerks: (...args: unknown[]) => mockPatreonRemovePerks(...args)
	}
}));
const mockVerifyGithubSecret = vi.fn<(raw: string, sig?: string) => boolean>();
vi.mock('../src/lib/githubSponsor.js', () => ({
	verifyGithubSecret: (raw: string, sig?: string) => mockVerifyGithubSecret(raw, sig)
}));
const mockWebhookSend = vi.fn();
vi.mock('../src/util.js', () => ({
	patronLogWebhook: { send: (...args: unknown[]) => mockWebhookSend(...args) }
}));

const TEST_USER = {
	id: BigInt('123456789012345678'),
	username: 'someuser'
};

globalThis.globalClient = {
	// @ts-expect-error
	users: {
		cache: new Collection<string, User>()
		// {
		// 	// @ts-expect-error
		// 	find: (fn: (u: { username: string; id: string }) => boolean) => {
		// 		const users = [{ username: 'someuser', id: '123456789012345678' }];
		// 		for (const u of users) if (fn(u)) return u;
		// 		return undefined;
		// 	}
		// }
	}
};
globalThis.globalClient.users.cache.set(TEST_USER.id.toString(), TEST_USER as any);

let app: Hono;

async function testRequest(
	path: string,
	options?: {
		method?: string;
		body?: any;
		headers?: Record<string, string>;
	}
) {
	if (typeof path !== 'string' || !path.startsWith('/')) {
		throw new Error('Path must be a string starting with /');
	}
	const result = await app.request(path, {
		method: (options?.method ?? 'GET') as any,
		headers: { ...(options?.headers ?? {}), 'content-type': 'application/json' },
		body: options?.body
	});
	return {
		status: result.status,
		text: () => result.text(),
		json: () => result.json()
	};
}

beforeAll(async () => {
	const sw = new Stopwatch();
	sw.check('Starting tests and initing clients');
	await initPrismaClients();
	sw.check('Finished initPrismaClients');

	mockVerifyPatreonSecret.mockReset().mockImplementation((_raw, sig) => sig === 'ok');
	mockParseStrToTier.mockReset().mockImplementation(name => (/tier\s*1/i.test(name) ? 'T1' : null));
	mockPatreonRun.mockReset().mockResolvedValue(['a', 'b']);
	mockPatreonChangeTier.mockReset();
	mockPatreonRemovePerks.mockReset();
	mockVerifyGithubSecret.mockReset().mockImplementation((_raw, sig) => sig === 'ok');
	mockWebhookSend.mockReset();
	sw.check('Finished mocks');

	app = await startServer();
	sw.check('startServer');
});

afterAll(async () => {
	for (const c of [globalThis.osbClient, globalThis.bsoClient, globalThis.roboChimpClient]) {
		if (c?.$disconnect) await c.$disconnect();
	}
});

describe('Hono app (testRequest)', () => {
	it('POST /webhooks/patreon missing header -> 400', async () => {
		const res = await testRequest('/webhooks/patreon', { method: 'POST', body: {} });
		expect(res.status).toBe(400);
	});

	it('POST /webhooks/patreon invalid -> 400', async () => {
		const res = await testRequest('/webhooks/patreon', {
			method: 'POST',
			body: {},
			headers: { 'x-patreon-signature': 'bad' }
		});
		expect(res.status).toBe(400);
	});

	it.skip('POST /webhooks/patreon valid -> 200, runs task', async () => {
		const res = await testRequest('/webhooks/patreon', {
			method: 'POST',
			body: {},
			headers: { 'x-patreon-signature': 'ok' }
		});
		expect(await res.text()).toBe('OK');
		expect(res.status).toBe(200);
		await Promise.resolve();
		expect(mockPatreonRun).toHaveBeenCalledTimes(1);
		expect(mockWebhookSend).toHaveBeenCalledWith('a\nb'.slice(0, 1950));
	});

	it('POST /webhooks/github invalid sig -> 400', async () => {
		const payload = { action: 'created', sender: { id: 999 }, sponsorship: { tier: { name: 'Tier 1' } } };
		const res = await testRequest('/webhooks/github', {
			method: 'POST',
			body: payload,
			headers: { 'content-type': 'application/json', 'x-hub-signature': 'bad' }
		});
		expect(res.status).toBe(400);
	});

	it.skip('POST /webhooks/github created -> changeTier', async () => {
		const payload = { action: 'created', sender: { id: 999 }, sponsorship: { tier: { name: 'Tier 1' } } };
		const res = await testRequest('/webhooks/github', {
			method: 'POST',
			body: payload,
			headers: { 'content-type': 'application/json', 'x-hub-signature': 'ok' }
		});
		expect(res.status).toBe(200);
		expect(mockPatreonChangeTier).toHaveBeenCalledTimes(1);
		const [ruser, tier] = mockPatreonChangeTier.mock.calls[0];
		expect((ruser as any).id).toBe(TEST_USER.id);
		expect(tier).toBe('T1');
	});

	it.skip('GET /minion/:id (OSB default)', async () => {
		const res = await testRequest(`/minion/${TEST_USER.id}`);
		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data).toMatchObject({
			id: TEST_USER.id,
			completed_ca_task_ids: [5, 6],
			is_ironman: true,
			leagues_completed_tasks_ids: [1, 2, 3]
		});
	});

	it('GET /minion/:id?bot=bso (BSO)', async () => {
		const res = await testRequest(`/minion/${TEST_USER.id}?bot=bso`);
		expect(res.status).toBe(404);
		expect(await res.json()).toEqual({ error: 'NOT_FOUND', message: 'User not found' });
	});

	it.skip('GET /minion/:username via discord cache', async () => {
		const res = await testRequest('/minion/someuser');
		expect(res.status).toBe(200);
		expect(await res.json()).toBe();
	});

	it('GET /minion/:bad -> 404 when no match', async () => {
		const prevFind = globalThis.globalClient.users.cache.find;
		globalThis.globalClient.users.cache.find = () => undefined;
		const res = await testRequest('/minion/not-a-snowflake');
		expect(res.status).toBe(404);
		expect(await res.json()).toEqual({ error: 'NOT_FOUND', message: 'Could not find this users id' });
		globalThis.globalClient.users.cache.find = prevFind;
	});
});
